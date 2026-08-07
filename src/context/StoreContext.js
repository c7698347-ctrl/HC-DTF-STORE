'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  DEFAULT_CATEGORIES, 
  INITIAL_PRODUCTS, 
  INITIAL_BANNERS, 
  INITIAL_SETTINGS, 
  INITIAL_CUSTOMERS, 
  INITIAL_ORDERS,
  INITIAL_FLASH_SALE,
  DEFAULT_ADMIN,
  TRACKING_STAGES,
  STATE_SHIPPING_RATES,
  getShippingChargeForState
} from '@/lib/store';
import { getTranslation, LANGUAGES } from '@/lib/i18n';

const StoreContext = createContext();

export function StoreProvider({ children }) {
  // 1. Language & i18n
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // 2. Main Store Entities State (Single Shared Products Database)
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [banners, setBanners] = useState(INITIAL_BANNERS);
  const [flashSale, setFlashSale] = useState(INITIAL_FLASH_SALE);
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);

  // 3. Customer User Session (OTP Verified Only)
  const [customerUser, setCustomerUser] = useState(null);

  // 4. Admin Session State
  const [adminUser, setAdminUser] = useState(null);

  // 5. Customer Cart, Wishlist, Buy Later, Recently Viewed
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [buyLater, setBuyLater] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // 6. UI Active Modals & Quick View
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Safe Financial Calculations (NO GST)
  const cartSubtotal = (cart || []).reduce((sum, item) => {
    const unitPrice = Number(item.offerPrice ?? item.price ?? 0);
    const qty = Number(item.quantity ?? 1);
    return sum + (unitPrice * qty);
  }, 0);

  const couponDiscount = appliedCoupon ? Math.round((cartSubtotal * (Number(appliedCoupon.percent) || 0)) / 100) : 0;
  const taxableTotal = Math.max(0, cartSubtotal - couponDiscount);
  const gstAmount = 0; // ZERO GST GUARANTEE

  // State-Wise Shipping Fee Helper
  const getShippingFeeForState = (stateName) => {
    if (cartSubtotal === 0) return 0;
    if (cartSubtotal > (settings.freeShippingAbove || 999)) return 0;
    const ratesMap = settings.stateShippingRates || STATE_SHIPPING_RATES;
    return getShippingChargeForState(stateName, ratesMap);
  };

  const defaultShippingFee = cartSubtotal > (settings.freeShippingAbove || 999) || cartSubtotal === 0 ? 0 : 150;
  const cartTotal = taxableTotal + defaultShippingFee;

  // Fetch products from single database API (/api/products)
  const fetchProductsFromApi = async () => {
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
        localStorage.setItem('hc_dtf_products', JSON.stringify(data.products));
      }
    } catch (e) {
      console.error('Error fetching products from database API:', e);
    }
  };

  useEffect(() => {
    fetchProductsFromApi();

    try {
      const savedOrders = localStorage.getItem('hc_dtf_orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));

      const savedAdmin = localStorage.getItem('hc_dtf_admin_session');
      if (savedAdmin) setAdminUser(JSON.parse(savedAdmin));

      const savedCustomer = localStorage.getItem('hc_dtf_customer_session');
      if (savedCustomer) setCustomerUser(JSON.parse(savedCustomer));

      const savedCustomersList = localStorage.getItem('hc_dtf_customers_list');
      if (savedCustomersList) setCustomers(JSON.parse(savedCustomersList));

      const savedCart = localStorage.getItem('hc_dtf_cart');
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedWishlist = localStorage.getItem('hc_dtf_wishlist');
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

      const savedSettings = localStorage.getItem('hc_dtf_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.error('LocalStorage load error', e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('hc_dtf_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('hc_dtf_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('hc_dtf_customers_list', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('hc_dtf_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('hc_dtf_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('hc_dtf_settings', JSON.stringify(settings));
  }, [settings]);

  // Helper i18n Translation getter
  const t = (key) => getTranslation(currentLanguage, key);

  // ================= ADMIN AUTH ACTIONS =================
  const loginAdmin = (email, password) => {
    if (email.toLowerCase() === DEFAULT_ADMIN.email) {
      if (password === 'hima143' || password === 'adminhimaloves') {
        const session = {
          email: DEFAULT_ADMIN.email,
          role: 'ADMIN',
          token: 'jwt_admin_secret_token_143'
        };
        setAdminUser(session);
        localStorage.setItem('hc_dtf_admin_session', JSON.stringify(session));
        return { success: true };
      }
    }
    return { success: false, error: 'Invalid admin credentials' };
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    localStorage.removeItem('hc_dtf_admin_session');
  };

  // ================= CUSTOMER AUTH ACTIONS =================
  const loginCustomerWithOtp = (phoneOrEmail, otp) => {
    if (otp !== '1234' && otp !== '1430') {
      return { success: false, error: 'Invalid OTP code entered' };
    }

    let existingCust = customers.find(c => c.phone === phoneOrEmail || c.email === phoneOrEmail);
    if (!existingCust) {
      existingCust = {
        id: `cust_${Date.now()}`,
        name: phoneOrEmail.includes('@') ? phoneOrEmail.split('@')[0] : `Customer ${phoneOrEmail.slice(-4)}`,
        phone: phoneOrEmail.includes('@') ? '' : phoneOrEmail,
        email: phoneOrEmail.includes('@') ? phoneOrEmail : '',
        totalOrders: 0,
        createdAt: new Date().toISOString()
      };
      setCustomers((prev) => [...prev, existingCust]);
    }

    setCustomerUser(existingCust);
    localStorage.setItem('hc_dtf_customer_session', JSON.stringify(existingCust));
    return { success: true, user: existingCust };
  };

  const logoutCustomer = () => {
    setCustomerUser(null);
    localStorage.removeItem('hc_dtf_customer_session');
  };

  // ================= PRODUCT ACTIONS =================
  const addProduct = (newProd) => {
    const created = {
      id: `prod_${Date.now()}`,
      slug: newProd.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      rating: 5.0,
      enabled: true,
      status: 'Published',
      ...newProd
    };
    setProducts((prev) => [created, ...prev]);

    // Save to Database API asynchronously
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(created)
    }).catch(console.error);

    return created;
  };

  const updateProduct = (id, updatedFields) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );

    // Save to Database API asynchronously
    fetch('/api/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updatedFields })
    }).catch(console.error);
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));

    // Delete from Database API asynchronously
    fetch('/api/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    }).catch(console.error);
  };

  const duplicateProduct = (p) => {
    const dup = {
      ...p,
      id: `prod_${Date.now()}`,
      name: `${p.name} (Copy)`,
      slug: `${p.slug || 'copy'}-${Date.now()}`
    };
    addProduct(dup);
  };

  // ================= CATEGORY ACTIONS =================
  const addCategory = (cat) => {
    const created = { id: `cat_${Date.now()}`, enabled: true, ...cat };
    setCategories((prev) => [...prev, created]);
  };

  const updateCategory = (id, fields) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...fields } : c)));
  };

  const deleteCategory = (id) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // ================= ORDER ACTIONS =================
  const addOrder = (orderObj) => {
    setOrders((prev) => [orderObj, ...prev]);

    // Update customer total orders
    if (orderObj.email || orderObj.phone) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.email === orderObj.email || c.phone === orderObj.phone) {
            return { ...c, totalOrders: (c.totalOrders || 0) + 1 };
          }
          return c;
        })
      );
    }
  };

  const updateOrderStatus = (orderId, status) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const updateOrderTracking = (orderId, trackingNumber, courierPartner) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, trackingNumber, courierPartner, status: 'Shipped' } : o))
    );
  };

  // ================= CART & WISHLIST ACTIONS =================
  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateCartQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const moveToBuyLater = (product) => {
    removeFromCart(product.id);
    setBuyLater((prev) => [...prev, product]);
  };

  const moveBuyLaterToCart = (product) => {
    setBuyLater((prev) => prev.filter((item) => item.id !== product.id));
    addToCart(product);
  };

  return (
    <StoreContext.Provider
      value={{
        // Language & i18n
        lang: currentLanguage,
        setLang: setCurrentLanguage,
        t,

        // Entities
        products,
        categories,
        banners,
        flashSale,
        settings,
        customers,
        orders,

        // Sessions
        customerUser,
        adminUser,

        // User Collections
        cart,
        wishlist,
        buyLater,
        recentlyViewed,
        appliedCoupon,

        // Safe Calculations
        cartSubtotal,
        couponDiscount,
        taxableTotal,
        gstAmount,
        defaultShippingFee,
        cartTotal,
        getShippingFeeForState,

        // UI States
        quickViewProduct,
        setQuickViewProduct,
        isCartOpen,
        setIsCartOpen,
        isAuthOpen,
        setIsAuthOpen,

        // Auth Handlers
        loginAdmin,
        logoutAdmin,
        loginCustomerWithOtp,
        logoutCustomer,

        // Entity Setters / Actions
        setSettings,
        setCategories,
        setBanners,

        // Product CRUD
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,

        // Category CRUD
        addCategory,
        updateCategory,
        deleteCategory,

        // Order CRUD
        addOrder,
        updateOrderStatus,
        updateOrderTracking,

        // Shopping Handlers
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist,
        moveToBuyLater,
        moveBuyLaterToCart
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
