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
  TRACKING_STAGES
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

  // Safe Financial Calculations
  const cartSubtotal = (cart || []).reduce((sum, item) => {
    const unitPrice = Number(item.offerPrice ?? item.price ?? 0);
    const qty = Number(item.quantity ?? 1);
    return sum + (unitPrice * qty);
  }, 0);

  const couponDiscount = appliedCoupon ? Math.round((cartSubtotal * (Number(appliedCoupon.percent) || 0)) / 100) : 0;
  const taxableTotal = Math.max(0, cartSubtotal - couponDiscount);
  const gstAmount = Math.round(taxableTotal * 0.18);
  const shippingFee = cartSubtotal > 999 || cartSubtotal === 0 ? 0 : 70;
  const cartTotal = taxableTotal + gstAmount + shippingFee;

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
      if (savedSettings) setSettings(JSON.parse(savedSettings));
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
          mustChangePassword: true
        };
        setAdminUser(session);
        localStorage.setItem('hc_dtf_admin_session', JSON.stringify(session));
        return { success: true, mustChangePassword: true };
      }
      
      const storedPass = localStorage.getItem('hc_dtf_admin_pass');
      if (storedPass && password === storedPass) {
        const session = {
          email: DEFAULT_ADMIN.email,
          role: 'ADMIN',
          mustChangePassword: false
        };
        setAdminUser(session);
        localStorage.setItem('hc_dtf_admin_session', JSON.stringify(session));
        return { success: true, mustChangePassword: false };
      }
    }
    return { success: false, error: 'Invalid Admin Credentials' };
  };

  const changeAdminPassword = (newPassword) => {
    localStorage.setItem('hc_dtf_admin_pass', newPassword);
    const updated = { ...adminUser, mustChangePassword: false };
    setAdminUser(updated);
    localStorage.setItem('hc_dtf_admin_session', JSON.stringify(updated));
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    localStorage.removeItem('hc_dtf_admin_session');
  };

  // ================= CUSTOMER OTP AUTH ACTIONS =================
  const sendOtpApi = async ({ identifier, type }) => {
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_otp', identifier, type })
      });
      const data = await res.json();
      return data;
    } catch (e) {
      console.error('OTP Send Error', e);
      return { success: false, error: 'Failed to connect to OTP service' };
    }
  };

  const verifyOtpAndLogin = async ({ identifier, type, otpCode }) => {
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_otp', identifier, type, otpCode })
      });
      const data = await res.json();

      if (!data.success) {
        return data;
      }

      const cleanIdent = identifier.trim().toLowerCase();
      
      let cust = customers.find((c) => 
        (type === 'mobile' && c.phone === identifier) ||
        (type === 'email' && c.email?.toLowerCase() === cleanIdent)
      );

      if (cust) {
        if (cust.isBlocked) {
          return { success: false, error: 'Your account has been suspended by Store Admin.' };
        }

        const updatedCust = {
          ...cust,
          verificationStatus: 'OTP Verified',
          lastLogin: new Date().toLocaleString()
        };

        setCustomerUser(updatedCust);
        localStorage.setItem('hc_dtf_customer_session', JSON.stringify(updatedCust));
        setCustomers((prev) => prev.map((c) => (c.id === cust.id ? updatedCust : c)));
        return { success: true, customer: updatedCust };
      }

      const newCust = {
        id: `cust-${Date.now()}`,
        name: type === 'email' ? cleanIdent.split('@')[0] : `Customer ${cleanIdent.slice(-4)}`,
        email: type === 'email' ? cleanIdent : '',
        phone: type === 'mobile' ? identifier : '',
        verificationStatus: 'OTP Verified',
        photo: '',
        address: '',
        addresses: [],
        totalOrders: 0,
        totalSpent: 0,
        lifetimeValue: 0,
        registrationDate: new Date().toISOString().split('T')[0],
        lastLogin: new Date().toLocaleString(),
        isBlocked: false
      };

      setCustomers((prev) => [...prev, newCust]);
      setCustomerUser(newCust);
      localStorage.setItem('hc_dtf_customer_session', JSON.stringify(newCust));
      return { success: true, customer: newCust };

    } catch (e) {
      console.error('OTP Verify Error', e);
      return { success: false, error: 'Network error verifying OTP' };
    }
  };

  const logoutCustomer = () => {
    setCustomerUser(null);
    localStorage.removeItem('hc_dtf_customer_session');
  };

  // ================= SAVED ADDRESSES MANAGER =================
  const addSavedAddress = (newAddrObj) => {
    if (!customerUser) return;

    const formattedAddr = {
      id: `addr-${Date.now()}`,
      fullName: newAddrObj.fullName?.trim() || '',
      mobile: newAddrObj.mobile?.trim() || '',
      email: newAddrObj.email?.trim() || '',
      houseFlatNo: newAddrObj.houseFlatNo?.trim() || '',
      street: newAddrObj.street?.trim() || '',
      area: newAddrObj.area?.trim() || '',
      landmark: newAddrObj.landmark?.trim() || '',
      city: newAddrObj.city?.trim() || '',
      district: newAddrObj.district?.trim() || '',
      state: newAddrObj.state?.trim() || '',
      pincode: newAddrObj.pincode?.trim() || '',
      isDefault: (customerUser.addresses || []).length === 0 ? true : Boolean(newAddrObj.isDefault)
    };

    let updatedAddresses = [...(customerUser.addresses || [])];
    if (formattedAddr.isDefault) {
      updatedAddresses = updatedAddresses.map(a => ({ ...a, isDefault: false }));
    }
    updatedAddresses.push(formattedAddr);

    const updatedCust = { ...customerUser, addresses: updatedAddresses };
    setCustomerUser(updatedCust);
    localStorage.setItem('hc_dtf_customer_session', JSON.stringify(updatedCust));
    setCustomers((prev) => prev.map((c) => (c.id === customerUser.id ? updatedCust : c)));
  };

  const updateSavedAddress = (addressId, updatedData) => {
    if (!customerUser) return;

    let updatedAddresses = (customerUser.addresses || []).map((addr) => {
      if (addr.id === addressId) {
        return { ...addr, ...updatedData };
      }
      if (updatedData.isDefault) {
        return { ...addr, isDefault: false };
      }
      return addr;
    });

    const updatedCust = { ...customerUser, addresses: updatedAddresses };
    setCustomerUser(updatedCust);
    localStorage.setItem('hc_dtf_customer_session', JSON.stringify(updatedCust));
    setCustomers((prev) => prev.map((c) => (c.id === customerUser.id ? updatedCust : c)));
  };

  const deleteSavedAddress = (addressId) => {
    if (!customerUser) return;

    const updatedAddresses = (customerUser.addresses || []).filter((a) => a.id !== addressId);
    const updatedCust = { ...customerUser, addresses: updatedAddresses };
    setCustomerUser(updatedCust);
    localStorage.setItem('hc_dtf_customer_session', JSON.stringify(updatedCust));
    setCustomers((prev) => prev.map((c) => (c.id === customerUser.id ? updatedCust : c)));
  };

  const updateCustomerProfile = (profileData) => {
    if (!customerUser) return;

    const updatedCust = {
      ...customerUser,
      ...profileData
    };
    setCustomerUser(updatedCust);
    localStorage.setItem('hc_dtf_customer_session', JSON.stringify(updatedCust));
    setCustomers((prev) => prev.map((c) => (c.id === customerUser.id ? updatedCust : c)));
  };

  // ================= SINGLE PRODUCTS DATABASE ACTIONS =================
  const addProduct = async (productData) => {
    const targetCat = DEFAULT_CATEGORIES.find(
      c => c.id === productData.categoryId || c.name.toLowerCase() === (productData.categoryName || productData.category)?.toLowerCase()
    ) || DEFAULT_CATEGORIES[0];

    const parsedTags = Array.isArray(productData.tags) 
      ? productData.tags.map(t => t.toLowerCase().trim()).filter(Boolean)
      : (typeof productData.tags === 'string' ? productData.tags.split(',').map(t => t.toLowerCase().trim()).filter(Boolean) : []);

    const payload = {
      name: productData.name.trim(),
      categoryId: targetCat.id,
      categoryName: targetCat.name,
      category: targetCat.name,
      subcategory: productData.subcategory || 'General',
      tags: parsedTags,
      price: Number(productData.price) || 0,
      offerPrice: Number(productData.offerPrice) || Number(productData.price) || 0,
      stock: Number(productData.stock) || 100,
      description: productData.description || '',
      images: Array.isArray(productData.images) && productData.images.length > 0 ? productData.images : ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800'],
      status: productData.status || 'Published',
      enabled: true,
      isFeatured: true,
      isTrending: true,
      isBestSeller: true,
      isPremium: true
    };

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
        localStorage.setItem('hc_dtf_products', JSON.stringify(data.products));
        return data.product;
      }
    } catch (e) {
      console.error('Error saving product to database API:', e);
    }

    // Fallback local update
    const fallbackProd = { ...payload, id: `prod-${Date.now()}` };
    setProducts((prev) => [fallbackProd, ...prev]);
    return fallbackProd;
  };

  const updateProduct = async (id, updatedData) => {
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updatedData })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
        localStorage.setItem('hc_dtf_products', JSON.stringify(data.products));
      }
    } catch (e) {
      console.error('Error updating product via database API:', e);
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updatedData } : p)));
    }
  };

  const deleteProduct = async (id) => {
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
        localStorage.setItem('hc_dtf_products', JSON.stringify(data.products));
      }
    } catch (e) {
      console.error('Error deleting product via database API:', e);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const duplicateProduct = async (productToDuplicate) => {
    await addProduct({
      ...productToDuplicate,
      name: `${productToDuplicate.name} (Copy)`
    });
  };

  // ================= MANUAL UPI PAYMENT & ORDER CONTROLLER =================
  const createOrder = (orderData) => {
    const newOrd = {
      id: `HC-ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      currentStageIndex: 0,
      status: 'Payment Verification Pending',
      paymentMethod: 'Manual UPI Transfer',
      paymentStatus: 'Verification Pending', // 'Verification Pending', 'Paid', 'Rejected', 'Screenshot Required'
      transactionId: orderData.transactionId || '',
      paymentScreenshot: orderData.paymentScreenshot || '',
      rejectionReason: '',
      internalNotes: '',
      courierName: '',
      trackingNumber: '',
      courierWebsite: '',
      shippingDate: '',
      expectedDeliveryDate: '',
      deliveryTimeSlot: '',
      dispatchNotes: '',
      isDelayed: false,
      delayDays: 0,
      delayReason: '',
      timeline: TRACKING_STAGES.map((st, idx) => ({
        stageId: st.id,
        label: st.label,
        timestamp: idx === 0 ? new Date().toLocaleString() : 'Pending',
        status: st.desc,
        completed: idx === 0,
        notes: ''
      })),
      ...orderData
    };

    setOrders((prev) => [newOrd, ...prev]);

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.email?.toLowerCase() === orderData.customerEmail?.toLowerCase() || c.phone === orderData.customerMobile) {
          const updatedSpent = (c.totalSpent || 0) + (orderData.total || 0);
          return {
            ...c,
            totalOrders: (c.totalOrders || 0) + 1,
            totalSpent: updatedSpent,
            lifetimeValue: updatedSpent
          };
        }
        return c;
      })
    );

    setCart([]);
    return newOrd;
  };

  const verifyOrderPayment = (orderId) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const currentStageIndex = 2; // Moves to Printing Started
          const updatedTimeline = (ord.timeline || TRACKING_STAGES).map((st, idx) => ({
            ...st,
            completed: idx <= currentStageIndex,
            timestamp: idx <= currentStageIndex ? (st.timestamp === 'Pending' ? new Date().toLocaleString() : st.timestamp) : st.timestamp
          }));

          return {
            ...ord,
            paymentStatus: 'Paid',
            status: 'Payment Verified & Confirmed',
            currentStageIndex,
            rejectionReason: '',
            timeline: updatedTimeline
          };
        }
        return ord;
      })
    );
  };

  const rejectOrderPayment = (orderId, reason) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            paymentStatus: 'Rejected',
            status: 'Payment Rejected',
            rejectionReason: reason || 'Invalid UTR Number or unverified bank credit'
          };
        }
        return ord;
      })
    );
  };

  const requestNewPaymentScreenshot = (orderId) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            paymentStatus: 'Screenshot Required',
            status: 'New Payment Screenshot Required'
          };
        }
        return ord;
      })
    );
  };

  const resubmitOrderPaymentProof = (orderId, { transactionId, paymentScreenshot }) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            transactionId: transactionId || ord.transactionId,
            paymentScreenshot: paymentScreenshot || ord.paymentScreenshot,
            paymentStatus: 'Verification Pending',
            status: 'Payment Verification Pending',
            rejectionReason: ''
          };
        }
        return ord;
      })
    );
  };

  const addOrderInternalNotes = (orderId, notes) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, internalNotes: notes } : ord))
    );
  };

  const updateOrderTrackingDetails = (orderId, updates) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const currentStageIndex = updates.currentStageIndex !== undefined ? updates.currentStageIndex : ord.currentStageIndex;
          const statusLabel = TRACKING_STAGES[currentStageIndex]?.label || ord.status;

          const updatedTimeline = (updates.timeline || ord.timeline || []).map((st, idx) => ({
            ...st,
            completed: idx <= currentStageIndex,
            timestamp: idx === currentStageIndex ? (st.timestamp === 'Pending' ? new Date().toLocaleString() : st.timestamp) : st.timestamp
          }));

          return {
            ...ord,
            ...updates,
            currentStageIndex,
            status: statusLabel,
            timeline: updatedTimeline
          };
        }
        return ord;
      })
    );
  };

  // ================= FLASH SALE & SETTINGS =================
  const createFlashSale = (data) => {
    setFlashSale((prev) => ({
      ...prev,
      ...data,
      enabled: true
    }));
  };

  const duplicateFlashSale = () => {
    const newHistoryItem = {
      id: `fs-${Date.now()}`,
      title: flashSale.title,
      orders: flashSale.ordersCount || 0,
      revenue: flashSale.totalRevenue || 0,
      date: new Date().toISOString().split('T')[0]
    };
    setFlashSale((prev) => ({
      ...prev,
      title: `${prev.title} (Clone)`,
      ordersCount: 0,
      totalRevenue: 0,
      history: [newHistoryItem, ...(prev.history || [])]
    }));
  };

  // ================= CART & WISHLIST ACTIONS =================
  const addToCart = (product, quantity = 1, options = {}) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { ...product, quantity, options }];
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

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const moveToBuyLater = (product) => {
    removeFromCart(product.id);
    setBuyLater((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const moveBuyLaterToCart = (product) => {
    setBuyLater((prev) => prev.filter((p) => p.id !== product.id));
    addToCart(product, 1);
  };

  const toggleCustomerBlock = (customerId) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, isBlocked: !c.isBlocked } : c))
    );
  };

  return (
    <StoreContext.Provider
      value={{
        // Store State
        products,
        categories,
        banners,
        flashSale,
        settings,
        customers,
        orders,
        customerUser,
        currentUser: customerUser,
        setCurrentUser: setCustomerUser,
        adminUser,
        cart,
        wishlist,
        buyLater,
        recentlyViewed,
        quickViewProduct,
        isCartOpen,
        isAuthOpen,
        isAuthModalOpen: isAuthOpen,
        setIsAuthModalOpen: setIsAuthOpen,
        currentLanguage,
        lang: currentLanguage,
        setLang: setCurrentLanguage,
        t,
        LANGUAGES,
        setCurrentLanguage,
        setQuickViewProduct,
        setIsCartOpen,
        setIsAuthOpen,
        fetchProductsFromApi,

        // Safe Calculated Financial Exports
        cartSubtotal,
        couponDiscount,
        gstAmount,
        shippingFee,
        cartTotal,
        appliedCoupon,
        setAppliedCoupon,

        // OTP Customer Authentication
        sendOtpApi,
        verifyOtpAndLogin,
        logoutCustomer,
        updateCustomerProfile,

        // Saved Addresses Controller
        addSavedAddress,
        updateSavedAddress,
        deleteSavedAddress,

        // Admin Auth
        loginAdmin,
        changeAdminPassword,
        logoutAdmin,

        // Single Products Database Actions
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,

        // Manual UPI Payment Verification Engine
        verifyOrderPayment,
        rejectOrderPayment,
        requestNewPaymentScreenshot,
        resubmitOrderPaymentProof,
        addOrderInternalNotes,

        // Flash Sale & Settings
        createFlashSale,
        duplicateFlashSale,
        setSettings,
        setBanners,

        // Orders & Tracking Controller
        updateOrderTrackingDetails,
        createOrder,

        // Customer Cart & Wishlist
        addToCart,
        removeFromCart,
        updateCartQuantity,
        toggleWishlist,
        moveToBuyLater,
        moveBuyLaterToCart,
        toggleCustomerBlock
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
