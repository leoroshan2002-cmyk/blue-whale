import { useEffect, useRef, useState } from 'react';
import { apiClient, invalidateProductCache } from '../../services/api';
import { loadInitialState, saveState } from '../utils/store.js';
import { notifyCatalogChanged } from '../../utils/catalogSync.js';
import { normalizeImageList } from '../../utils/productImages.js';
import CampaignManagement from "../../Pages/CampaignManagement";
import { useAuth } from '../../Context/AuthContext';
import { DashboardView } from '../components/DashboardView.jsx';
import { ProductsView } from '../components/ProductsView.jsx';
import { OrdersView } from '../components/OrdersView.jsx';
import { CMSView } from '../components/CMSView.jsx';
import { AdminProfileView } from '../components/AdminProfileView.jsx';
import {
  CategoriesView,
  CustomersView,
  InventoryView,
  CouponsView,
  AnalyticsView,
  SettingsView
} from '../components/OtherViews.jsx';

export function useAdminController() {
  const { user, isAuthReady, logout } = useAuth();
  const [state, setState] = useState(() => loadInitialState());
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => user?.role === 'admin');
  const [notifications, setNotifications] = useState([]);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [toast, setToast] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const toastTimeoutRef = useRef(null);

  useEffect(() => {
    setIsAdminLoggedIn(Boolean(user?.role === 'admin'));
    setIsHydrated(Boolean(isAuthReady));
  }, [user, isAuthReady]);

  useEffect(() => {
    if (!isHydrated) return;
    saveState(state);
  }, [state, isHydrated]);

  useEffect(() => {
    if (!isHydrated || !isAdminLoggedIn) return;

    let isMounted = true;

    const fetchAdminData = async () => {
      try {
        const [productsResponse, categoriesResponse, customersResponse, couponsResponse] = await Promise.all([
          apiClient.get('/api/admin/products'),
          apiClient.get('/api/admin/categories'),
          apiClient.get('/api/admin/customers'),
          apiClient.get('/api/admin/coupons').catch(() => ({ data: { coupons: [] } }))
        ]);

        let ordersResponse;
        try {
          ordersResponse = await apiClient.get('/api/admin/orders');
        } catch (orderError) {
          ordersResponse = await apiClient.get('/api/orders').catch(() => ({ data: { orders: [] } }));
        }

        if (!isMounted) return;

        const serverProducts = Array.isArray(productsResponse?.data?.products) ? productsResponse.data.products : [];
        const serverCategories = Array.isArray(categoriesResponse?.data?.categories) ? categoriesResponse.data.categories : [];
        const serverOrders = Array.isArray(ordersResponse?.data?.orders) ? ordersResponse.data.orders : [];
        const serverCustomers = Array.isArray(customersResponse?.data?.customers) ? customersResponse.data.customers : [];
        const serverCoupons = Array.isArray(couponsResponse?.data?.coupons) ? couponsResponse.data.coupons : [];

        const localUserOrders = (() => {
          if (typeof window === 'undefined') return [];
          try {
            const storedOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
            return Array.isArray(storedOrders) ? storedOrders : [];
          } catch {
            return [];
          }
        })();

        const normalizeOrder = (order) => {
          const customer = order?.customer || {};
          const shippingAddress = order?.shippingAddress || {};
          const customerPhone = order?.customerPhone || customer?.phone || '';
          const customerAddressText = order?.customerAddressText || customer?.address || [
            shippingAddress.street,
            shippingAddress.city,
            shippingAddress.state,
            shippingAddress.zip,
            shippingAddress.country,
          ].filter(Boolean).join(', ');

          return {
            ...order,
            id: order.id || order.orderId || order._id || `local-${Date.now()}-${Math.random()}`,
            customerName: order.customerName || customer.name || order.customer?.fullName || 'Customer',
            customerEmail: order.customerEmail || customer.email || '',
            customerPhone,
            customerAddressText,
            customer: {
              ...(customer || {}),
              name: order.customerName || customer.name || order.customer?.fullName || 'Customer',
              email: order.customerEmail || customer.email || '',
              phone: customerPhone,
              address: customerAddressText,
            },
            shippingAddress: {
              fullName: shippingAddress.fullName || customer.fullName || '',
              phone: shippingAddress.phone || customer.phone || customer.mobile || '',
              address: shippingAddress.address || shippingAddress.street || customer.address || '',
              street: shippingAddress.street || shippingAddress.address || customer.address || '',
              city: shippingAddress.city || '',
              state: shippingAddress.state || '',
              pincode: shippingAddress.pincode || shippingAddress.zip || '',
              zip: shippingAddress.zip || shippingAddress.pincode || '',
              country: shippingAddress.country || 'India',
            },
            items: Array.isArray(order.items) ? order.items.map((item) => ({
              ...item,
              name: item.name || item.productName || 'Product',
              quantity: Number(item.qty || item.quantity || 1),
              price: Number(item.price || 0),
            })) : [],
            total: Number(order.total || 0),
            paymentStatus: order.paymentStatus || order.payment?.status || 'Pending',
            status: order.status || 'Processing',
            courier: order.courier || 'Not Assigned',
            estimatedDelivery: order.estimatedDelivery || null,
            trackingHistory: Array.isArray(order.trackingHistory) ? order.trackingHistory : [],
            createdAt: order.createdAt || new Date().toISOString(),
          };
        };

        const normalizedLocalOrders = localUserOrders.map(normalizeOrder);

        const normalizedCustomers = serverCustomers.map((customer) => ({
          ...customer,
          id: customer.id || customer._id || customer.userId,
          name: customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Customer',
          email: customer.email || '',
          phone: customer.phone || 'Not provided',
          avatar: customer.avatar || '',
          status: customer.status || 'Active',
          orderCount: Number(customer.orderCount || 0),
          totalSpend: Number(customer.totalSpend || 0),
          lastActive: customer.lastActive || customer.createdAt || new Date().toISOString(),
        }));

        const activeServerOrders = Array.isArray(serverOrders)
          ? serverOrders.filter((order) => order && (order.id || order.orderId || order._id))
          : [];

        const normalizedServerOrders = activeServerOrders.map(normalizeOrder);

        const mergedOrders = normalizedServerOrders.length > 0
          ? normalizedServerOrders
          : normalizedLocalOrders;

        setState((prev) => ({
          ...prev,
          products: serverProducts.length > 0 ? serverProducts : prev.products,
          categories: serverCategories.length > 0 ? serverCategories : prev.categories,
          orders: mergedOrders,
          customers: normalizedCustomers.length > 0 ? normalizedCustomers : prev.customers,
          coupons: serverCoupons.length > 0 ? serverCoupons : prev.coupons
        }));
      } catch (error) {
        console.error('Failed to load admin data from the backend:', error);
      }
    };

    fetchAdminData();

    const handleOrderChange = () => {
      fetchAdminData();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('haierah-order-created', handleOrderChange);
      window.addEventListener('haierah-order-cancelled', handleOrderChange);
      window.addEventListener('haierah-order-deleted', handleOrderChange);
      window.addEventListener('storage', handleOrderChange);
    }

    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('haierah-order-created', handleOrderChange);
        window.removeEventListener('haierah-order-cancelled', handleOrderChange);
        window.removeEventListener('haierah-order-deleted', handleOrderChange);
        window.removeEventListener('storage', handleOrderChange);
      }
    };
  }, [isHydrated, isAdminLoggedIn]);

  useEffect(() => {
    if (currentTab === 'orders' && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('haierah-order-created'));
    }
  }, [currentTab]);

  const addNotification = (text, timeLabel = 'Just now') => {
    const id = `notif-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setNotifications((prev) => [{ id, text, time: timeLabel, read: false }, ...prev]);
  };

  const triggerToast = (text) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    const id = `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToast({ id, text });
    toastTimeoutRef.current = setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 4500);
  };

  const resolveProductIdentifier = (product) => product?.id || product?._id || null;

  const buildProductFormData = (prod) => {
    const formData = new FormData();
    const safeProduct = { ...prod };
    const imageFiles = Array.isArray(safeProduct.imageFiles) ? safeProduct.imageFiles : [];
    const safeImages = normalizeImageList(safeProduct.images);
    const normalizedVariants = safeProduct.variants && typeof safeProduct.variants === 'object'
      ? {
          sizes: Array.isArray(safeProduct.variants.sizes) ? safeProduct.variants.sizes.filter(Boolean) : [],
          colors: Array.isArray(safeProduct.variants.colors) ? safeProduct.variants.colors.filter((color) => color && (color.name || color.hex)) : []
        }
      : { sizes: [], colors: [] };

    safeProduct.images = safeImages;
    safeProduct.variants = normalizedVariants;
    delete safeProduct.imageFiles;

    Object.entries(safeProduct).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        formData.append(key, '');
        return;
      }

      if (Array.isArray(value) || typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    });

    if (safeImages.length > 0) {
      formData.append('imageUrls', JSON.stringify(safeImages));
    }

    imageFiles.forEach((file) => formData.append('productImage', file));
    return formData;
  };

  const handleAddProduct = async (prod) => {
    const fallbackProduct = {
      ...prod,
      id: prod.id || `prod-local-${Date.now()}`,
      createdAt: prod.createdAt || new Date().toISOString(),
      status: 'Active'
    };

    try {
      const formData = buildProductFormData(prod);
      const { data } = await apiClient.post('/api/admin/products', formData);
      const savedProduct = data.product || fallbackProduct;
      const savedProductId = resolveProductIdentifier(savedProduct);
      setState((prev) => ({
        ...prev,
        products: [savedProduct, ...prev.products.filter((p) => resolveProductIdentifier(p) !== savedProductId)]
      }));
      if (typeof window !== 'undefined') {
        notifyCatalogChanged('product-created');
      }
      addNotification(`New product added: ${savedProduct.name}`);
      triggerToast(`Listing introduced: ${savedProduct.name}`);
    } catch (error) {
      console.error('Failed to save product:', error);
      setState((prev) => ({
        ...prev,
        products: [fallbackProduct, ...prev.products.filter((p) => p.id !== fallbackProduct.id)]
      }));
      triggerToast(`Product saved locally while syncing with the backend.`);
      alert(error?.response?.data?.message || error.message || 'Unable to save product to the backend. It was saved locally for now.');
    }
  };

  const handleUpdateProduct = async (prod) => {
    const fallbackProduct = { ...prod };

    try {
      const formData = buildProductFormData(prod);
      const { data } = await apiClient.put(`/api/admin/products/${prod.id}`, formData);
      const updatedProduct = data.product || fallbackProduct;
      const updatedProductId = resolveProductIdentifier(updatedProduct);
      setState((prev) => ({
        ...prev,
        products: prev.products.map((p) => (resolveProductIdentifier(p) === updatedProductId ? updatedProduct : p))
      }));
      if (typeof window !== 'undefined') {
        notifyCatalogChanged('product-updated');
      }
      addNotification(`Product updated: ${updatedProduct.name || prod.name}`);
    } catch (error) {
      console.error('Failed to update product:', error);
      setState((prev) => ({
        ...prev,
        products: prev.products.map((p) => (p.id === fallbackProduct.id ? fallbackProduct : p))
      }));
      triggerToast(`Product updated locally while syncing with the backend.`);
      alert(error?.response?.data?.message || error.message || 'Unable to update product in the backend. It was updated locally for now.');
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await apiClient.delete(`/api/admin/products/${id}`);
      setState((prev) => ({
        ...prev,
        products: prev.products.filter((p) => resolveProductIdentifier(p) !== id)
      }));
      if (typeof window !== 'undefined') {
        notifyCatalogChanged('product-deleted');
      }
      addNotification('Product removed from the catalog.');
      triggerToast('Product removed from the catalog.');
    } catch (error) {
      const status = error?.response?.status;
      if (status === 404) {
        setState((prev) => ({
          ...prev,
          products: prev.products.filter((p) => resolveProductIdentifier(p) !== id)
        }));
        triggerToast('Product removed from the catalog.');
        return;
      }

      console.error('Failed to delete product:', error);
      alert(error?.response?.data?.message || error.message || 'Unable to delete product from the backend.');
    }
  };

  const buildCategoryFormData = (cat) => {
    const formData = new FormData();
    const safeCategory = { ...cat };
    const imageFile = safeCategory.imageFile;
    delete safeCategory.imageFile;

    if (imageFile) {
      formData.append('image', imageFile);
    }

    Object.entries(safeCategory).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        formData.append(key, '');
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    });

    return formData;
  };

  const handleAddCategory = async (cat) => {
    try {
      const { id, ...categoryData } = cat;
      const formData = buildCategoryFormData(categoryData);
      const { data } = await apiClient.post('/api/admin/categories', formData);
      const savedCategory = data.category;
      setState((prev) => ({
        ...prev,
        categories: [savedCategory, ...prev.categories.filter((c) => c.id !== savedCategory.id)]
      }));
      addNotification(`Category added: ${savedCategory.name}`);
      triggerToast(`Category added: ${savedCategory.name}`);
    } catch (error) {
      console.error('Failed to save category:', error);
      alert(error.message || 'Unable to save category to the backend.');
    }
  };

  const handleUpdateCategory = async (cat) => {
    try {
      const { id, ...categoryData } = cat;
      const formData = buildCategoryFormData(categoryData);
      const { data } = await apiClient.put(`/api/admin/categories/${cat.id}`, formData);
      const updatedCategory = data.category;
      setState((prev) => ({
        ...prev,
        categories: prev.categories.map((c) => (c.id === updatedCategory.id ? updatedCategory : c))
      }));
      addNotification(`Category updated: ${updatedCategory.name || cat.name}`);
    } catch (error) {
      console.error('Failed to update category:', error);
      alert(error.message || 'Unable to update category in the backend.');
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await apiClient.delete(`/api/admin/categories/${id}`);
      setState((prev) => ({
        ...prev,
        categories: prev.categories.filter((c) => c.id !== id)
      }));
      addNotification('Category removed from the catalog.');
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert(error.message || 'Unable to delete category from the backend.');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await apiClient.delete(`/api/admin/orders/${orderId}`);

      if (typeof window !== 'undefined') {
        try {
          const storedOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
          const filtered = (Array.isArray(storedOrders) ? storedOrders : []).filter((order) => (order.id || order.orderId || order._id) !== orderId);
          localStorage.setItem('userOrders', JSON.stringify(filtered));
          window.dispatchEvent(new Event('haierah-order-deleted'));
        } catch {
          // ignore storage issues
        }
      }

      setState((prev) => ({
        ...prev,
        orders: prev.orders.filter((order) => (order.id || order.orderId || order._id) !== orderId)
      }));
      addNotification('Order removed from the admin list.');
      triggerToast('Order removed from the admin list.');
    } catch (error) {
      console.error('Failed to delete order:', error);
      alert(error?.response?.data?.message || error.message || 'Unable to delete order from the backend.');
    }
  };

  const handleUpdateOrderStatus = async (orderId, updates = {}) => {
    try {
      const payload = typeof updates === 'object' && updates !== null
        ? updates
        : { status: updates, paymentStatus: undefined };

      const { data } = await apiClient.put(`/api/admin/orders/${orderId}`, payload);
      const updatedOrder = data.order;

      const refreshedProducts = await apiClient.get('/api/admin/products').then((response) => response?.data?.products || []);

      setState((prev) => ({
        ...prev,
        products: refreshedProducts.length > 0 ? refreshedProducts : prev.products,
        orders: prev.orders.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      }));

      if (String(updatedOrder?.status || '').toLowerCase() === 'cancelled' || String(payload?.status || '').toLowerCase() === 'cancelled') {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('haierah-order-cancelled'));
        }
      }

      addNotification(`Order updated successfully.`);
      triggerToast(`Order updated successfully.`);
      return updatedOrder;
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert(error?.response?.data?.message || error.message || 'Unable to update order in the backend.');
      return null;
    }
  };

  const handleToggleCustomerStatus = (id) => {
    setState((prev) => ({
      ...prev,
      customers: prev.customers.map((c) => (c.id === id ? { ...c, status: c.status === 'Active' ? 'Suspended' : 'Active' } : c))
    }));
  };

  const handleQuickRestock = async (id, amount) => {
    const currentProduct = state.products.find((p) => p.id === id || p._id === id);
    if (!currentProduct) return;

    const nextStock = Math.max(0, Number(currentProduct.stock || 0) + Number(amount || 0));

    try {
      const formData = buildProductFormData({ ...currentProduct, stock: nextStock });
      const { data } = await apiClient.put(`/api/admin/products/${id}`, formData);
      const updatedProduct = data.product || { ...currentProduct, stock: nextStock };

      setState((prev) => ({
        ...prev,
        products: prev.products.map((p) => {
          const matches = resolveProductIdentifier(p) === resolveProductIdentifier(currentProduct) || resolveProductIdentifier(p) === id;
          return matches ? updatedProduct : p;
        })
      }));

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('haierah-products-updated'));
      }

      addNotification(`Stock updated for ${updatedProduct.name || currentProduct.name}`);
      triggerToast(`Stock updated for ${updatedProduct.name || currentProduct.name}`);
    } catch (error) {
      console.error('Failed to restock product:', error);
      alert(error?.response?.data?.message || error.message || 'Unable to update stock in the backend.');
    }
  };

  const handleUpdateCMS = (updatedSections) => {
    setState((prev) => ({
      ...prev,
      cms: updatedSections
    }));
  };

  const handleAddCoupon = async (cp) => {
    try {
      const normalizedCoupon = {
        ...cp,
        code: String(cp.code || '').trim().toUpperCase(),
        type: cp.type || 'Percentage',
        value: Number(cp.value ?? cp.discount ?? 0) || 0,
        minSpend: Number(cp.minSpend ?? cp.minOrderValue ?? 0) || 0,
        expirationDate: cp.expirationDate || cp.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: cp.isActive !== false,
        usesCount: Number(cp.usesCount ?? 0) || 0,
        usageLimit: Number(cp.usageLimit ?? 0) || 0,
      };

      const { data } = await apiClient.post('/api/admin/coupons', normalizedCoupon);
      const savedCoupon = data.coupon || normalizedCoupon;

      setState((prev) => ({
        ...prev,
        coupons: [savedCoupon, ...prev.coupons.filter((c) => c.id !== savedCoupon.id)]
      }));
      addNotification(`Coupon created: ${savedCoupon.code}`);
      triggerToast(`Coupon created: ${savedCoupon.code}`);
    } catch (error) {
      console.error('Failed to create coupon:', error);
      alert(error?.response?.data?.message || error.message || 'Unable to save coupon to the backend.');
    }
  };

  const handleToggleCoupon = async (id) => {
    try {
      const { data } = await apiClient.patch(`/api/admin/coupons/${id}/toggle`);
      const updatedCoupon = data.coupon;

      setState((prev) => ({
        ...prev,
        coupons: prev.coupons.map((c) => (c.id === id ? { ...c, ...updatedCoupon } : c))
      }));
    } catch (error) {
      console.error('Failed to toggle coupon:', error);
      alert(error?.response?.data?.message || error.message || 'Unable to update coupon status.');
    }
  };

  const handleDeleteCoupon = async (id) => {
    try {
      await apiClient.delete(`/api/admin/coupons/${id}`);
      setState((prev) => ({
        ...prev,
        coupons: prev.coupons.filter((c) => c.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete coupon:', error);
      alert(error?.response?.data?.message || error.message || 'Unable to delete coupon.');
    }
  };

  const handleUpdateSettings = (sets) => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...sets,
        paymentGateways: {
          ...prev.settings.paymentGateways,
          ...(sets.paymentGateways || {})
        }
      }
    }));
  };

  const handleLogout = async () => {
    await logout();
    setIsAdminLoggedIn(false);
  };

  const handleSimulateSale = async () => {
    if (state.customers.length === 0 || state.products.length === 0) {
      alert('Sandbox holds no customer profiles or garments listings to process checkout.');
      return;
    }

    const activeCustomers = state.customers.filter((c) => c.status === 'Active');
    const customer = activeCustomers[Math.floor(Math.random() * activeCustomers.length)] || state.customers[0];
    const sampleProducts = [...state.products].filter((p) => p.stock > 0);

    if (sampleProducts.length === 0) {
      alert('Simulation warning: Zero products hold stock. Restock items under Inventory folder.');
      return;
    }

    const item1 = sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
    const itemImage = item1.image || item1.images?.[0] || '';
    const itemSku = item1.sku || item1.id || item1._id || '';
    const itemsToBuy = [{
      productId: itemSku,
      quantity: 1,
      size: item1.variants?.sizes?.[Math.floor(Math.random() * (item1.variants?.sizes?.length || 1))] || 'M',
      color: item1.variants?.colors?.[Math.floor(Math.random() * (item1.variants?.colors?.length || 1))]?.name || 'Onyx Black'
    }];

    try {
      const orderPayload = {
        orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: customer.name,
        customerEmail: customer.email,
        customerAvatar: customer.avatar,
        items: itemsToBuy.map((item) => ({
          productId: item.productId,
          name: item1.name,
          quantity: item.quantity,
          price: item1.discountPrice || item1.price,
          image: itemImage,
        })),
        total: (item1.discountPrice || item1.price) * itemsToBuy[0].quantity,
        paymentStatus: 'Paid',
        status: 'Pending',
      };

      const { data } = await apiClient.post('/api/admin/orders', orderPayload);
      const savedOrder = data.order;

      const refreshedProducts = await apiClient.get('/api/admin/products').then((response) => response?.data?.products || []);

      setState((prev) => ({
        ...prev,
        products: refreshedProducts.length > 0 ? refreshedProducts : prev.products,
        orders: [savedOrder, ...prev.orders.filter((o) => o.id !== savedOrder.id)]
      }));

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('haierah-products-updated'));
        window.dispatchEvent(new Event('haierah-order-created'));
      }

      addNotification(`New order ${savedOrder.id} generated via sandbox simulation: ${item1.name}`);
      triggerToast(`Simulation: ${customer.name} purchased ${item1.name} ($${savedOrder.total.toFixed(2)})`);
    } catch (error) {
      console.error('Failed to create simulated order:', error);
      alert(error.message || 'Unable to save simulated order to the backend.');
    }
  };

  const renderViewContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardView
            products={state.products}
            orders={state.orders}
            customers={state.customers}
            couponsCount={state.coupons.length}
            onNavigate={(tab) => setCurrentTab(tab)}
            onSimulateSale={handleSimulateSale}
          />
        );
      case 'products':
        return (
          <ProductsView
            products={state.products}
            categories={state.categories}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        );
      case 'categories':
        return (
          <CategoriesView
            categories={state.categories}
            products={state.products}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        );
      case 'campaigns':
         return (
        <CampaignManagement />
        );
      case 'orders':
        return (
          <OrdersView
            orders={state.orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
            currencySymbol={state.settings.currencySymbol || (state.settings.currency === 'EUR' ? '€' : state.settings.currency === 'GBP' ? '£' : state.settings.currency === 'JPY' ? '¥' : state.settings.currency === 'INR' ? '₹' : '$')}
          />
        );
      case 'customers':
        return <CustomersView customers={state.customers} onToggleStatus={handleToggleCustomerStatus} />;
      case 'inventory':
        return <InventoryView products={state.products} onQuickRestock={handleQuickRestock} />;
      case 'cms':
        return <CMSView sections={state.cms} products={state.products} onUpdateCMS={handleUpdateCMS} />;
      case 'coupons':
        return (
          <CouponsView
            coupons={state.coupons}
            onAddCoupon={handleAddCoupon}
            onToggleCoupon={handleToggleCoupon}
            onDeleteCoupon={handleDeleteCoupon}
          />
        );
      case 'analytics':
        return <AnalyticsView products={state.products} orders={state.orders} customers={state.customers} />;
      case 'settings':
        return <SettingsView settings={state.settings} onUpdateSettings={handleUpdateSettings} />;
      case 'profile':
        return <AdminProfileView />;
      default:
        return <div className="p-8 text-center text-slate-500 font-bold">Workspace View Commits Failed.</div>;
    }
  };

  return {
    state,
    currentTab,
    sidebarCollapsed,
    isAdminLoggedIn,
    notifications,
    showNotifDrawer,
    toast,
    user,
    setCurrentTab,
    setSidebarCollapsed,
    setIsAdminLoggedIn,
    setShowNotifDrawer,
    setNotifications,
    handleSimulateSale,
    handleLogout,
    renderViewContent,
    markNotificationsRead: () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  };
}
