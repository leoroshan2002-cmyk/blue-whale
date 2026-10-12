import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

const toProductResponse = (product) => {
  const doc = product.toObject();
  doc.id = doc._id.toString();
  delete doc._id;
  return doc;
};

const toOrderResponse = (order) => {
  const doc = order.toObject();
  doc.id = doc.orderId || doc._id.toString();
  delete doc._id;
  return doc;
};

const toUserResponse = (user) => {
  const doc = user.toObject();
  doc.id = doc._id.toString();
  delete doc._id;
  return doc;
};

export const getAdminDashboard = async (_req, res) => {
  try {
    const [products, orders, customers] = await Promise.all([
      Product.find().sort({ createdAt: -1 }),
      Order.find().sort({ createdAt: -1 }),
      User.find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 }),
    ]);

    const totalSales = orders
      .filter((order) => order.status !== 'Cancelled')
      .reduce((sum, order) => sum + (order.total || 0), 0);

    const pendingOrders = orders.filter((order) => order.status === 'Pending').length;
    const lowStockCount = products.filter((product) => product.stock > 0 && product.stock <= 5).length;
    const outOfStockCount = products.filter((product) => product.stock === 0).length;

    const categorySummary = orders.reduce((acc, order) => {
      order.items.forEach((item) => {
        const product = products.find((entry) => entry._id.toString() === item.productId || entry.sku === item.productId);
        const category = product?.category || 'General';

        if (!acc[category]) {
          acc[category] = { name: category, value: 0, qty: 0 };
        }

        acc[category].value += (item.price || 0) * (item.quantity || 0);
        acc[category].qty += item.quantity || 0;
      });
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      dashboard: {
        metrics: {
          sales: Number(totalSales.toFixed(2)),
          ordersCount: orders.length,
          customersCount: customers.length,
          alerts: lowStockCount + outOfStockCount,
          pendingOrders,
          lowStockCount,
          outOfStockCount,
        },
        products: products.map(toProductResponse),
        orders: orders.map(toOrderResponse),
        customers: customers.map(toUserResponse),
        categorySummary: Object.values(categorySummary),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

