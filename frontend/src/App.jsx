import React, { useState, useEffect, useCallback } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Layout from "./Layout/Layout";
import LoadingScreen from "./Components/LoadingScreen";
import ErrorBoundary from "./Components/ErrorBoundary";

import AdminProtectedRoute from "./Components/AdminProtectedRoute";

import Wishlist from "./Components/Whislist";
import ScrollTop from "./Components/ScrollTop";
import Account from "./Components/AccountDetails/Account";

import ProtectedRoute from "./Components/ProtectedRoutes";
import OrderHistory from "./Components/AccountDetails/OrderHistory";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AdminDashboard from "./Pages/AdminDashboard";
import ProductsPage from "./Pages/ProductsPage";
import ProductPage from "./Pages/ProductPage";
import CategoryPage from "./Pages/CategoryPage";
import CartPage from "./Pages/CartPage";
import CheckoutPage from "./Pages/CheckoutPage";
import NotFound from "./Pages/NotFound";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import OrderSuccessPage from "./Pages/OrderSuccessPage";
import BestSellers from "./Components/footer/BestSellers";
import ShippingReturns from "./Components/footer/ShippingReturns";
import PrivacyPolicy from "./Components/footer/PrivacyPolicy";
import TermsOfService from "./Components/footer/TermsOfService";
import Contact from "./Components/footer/Contact";
import BrandStory from "./Components/footer/BrandStory";
import Sustainability from "./Components/footer/Sustainability";
import Press from "./Components/footer/Press";
import StoreLocator from "./Components/footer/StoreLocator";

const App = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const handleLoaded = useCallback(() => setIsLoaded(true), []);

  useEffect(() => {
    // Suppress React DevTools console message
    const originalInfo = console.info;
    console.info = (...args) => {
      if (
        typeof args[0] === "string" &&
        args[0].includes("Download the React DevTools")
      ) {
        return;
      }
      originalInfo(...args);
    };
    return () => {
      console.info = originalInfo;
    };
  }, []);

  return (
    <>
      <ToastContainer position="top-right" autoClose={1500} />

      {!isLoaded && <LoadingScreen onComplete={handleLoaded} />}

      <div
        style={{
          visibility: isLoaded ? "visible" : "hidden",
        }}
        className="bg-[#f8f7f5] min-h-screen"
      >
        <Router>
          <ScrollTop />

          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* OPEN THE APP AT category */}
            <Route path="/" element={<Navigate to="/category/men" replace />} />
            <Route
              path="/home"
              element={<Navigate to="/category/men" replace />}
            />
            <Route
              path="/category"
              element={<Navigate to="/category/men" replace />}
            />

            <Route element={<Layout />}>
              <Route path="/best-sellers" element={<BestSellers />} />
              <Route path="/shipping-returns" element={<ShippingReturns />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/brand-story" element={<BrandStory />} />
              <Route path="/sustainability" element={<Sustainability />} />
              <Route path="/press" element={<Press />} />
              <Route path="/store-locator" element={<StoreLocator />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/product/:id" element={<ProductPage />} />
            </Route>

            {/* ADMIN ROUTE */}
            <Route
              path="/admin"
              element={
                <ErrorBoundary>
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
                </ErrorBoundary>
              }
            />

            {/* USER ROUTES */}
            <Route
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            >
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/order-success" element={<OrderSuccessPage />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/account" element={<Account />} />
              <Route path="/orders" element={<OrderHistory />} />
            </Route>

            {/* NOT FOUND */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </div>
    </>
  );
};

export default App;
