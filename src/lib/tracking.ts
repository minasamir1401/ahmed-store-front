// Global tracking utilities for The VitaHub
// Supports Meta Pixel (fbq), Google Analytics (gtag), TikTok Pixel (ttq), and Snapchat Pixel (snaptr)

export interface TrackedProduct {
  id: string;
  title: string;
  price: number;
  image?: string;
  quantity?: number;
}

export interface TrackedOrder {
  id: string;
  orderNumber: string;
  total: number;
  shippingFee: number;
  items: Array<{
    productId: string;
    title: string;
    price: number;
    quantity: number;
  }>;
}

// Check if debug logs are enabled (mina password check, aligns with ConsoleManager.tsx)
const isDebugEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('debug_pwd') === 'mina';
};

const logDebug = (platform: string, event: string, data?: any) => {
  if (isDebugEnabled()) {
    // We bypass console suppression using direct console.info / console.log if ConsoleManager overrides them,
    // but here we just write to native print or write if we want to show it.
    // Since ConsoleManager overrides console.log, let's write to console.log anyway, or use alert/store.
    // Actually, window.console.info is standard. Let's just print to console.
    (console as any)._log ? (console as any)._log(`📊 [Tracking - ${platform}] ${event}`, data) : console.log(`📊 [Tracking - ${platform}] ${event}`, data);
  }
};

const BACKEND_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const sendEventToBackend = async (eventName: string, metadata?: any) => {
  if (typeof window === 'undefined') return;
  try {
    const url = window.location.href;
    const token = localStorage.getItem('vitamins_hub_auth_token');
    const headers: any = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    await fetch(`${BACKEND_API}/api/pixel-events`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        eventName,
        url,
        metadata
      })
    });
  } catch (err) {
    console.error('Error sending pixel event to backend:', err);
  }
};

/**
 * Sends a PageView event to all configured pixels
 */
export const trackPageView = (url: string) => {
  if (typeof window === 'undefined') return;

  // Send to backend database
  sendEventToBackend('PageView', { path: url });

  // Meta (Facebook)
  if (typeof (window as any).fbq === 'function') {
    (window as any).fbq('track', 'PageView');
    logDebug('Meta', 'PageView', { url });
  }

  // Google Analytics
  const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
  if (gaId && typeof (window as any).gtag === 'function') {
    (window as any).gtag('config', gaId, { page_path: url });
    logDebug('Google', 'PageView', { url, gaId });
  }

  // TikTok
  if (typeof (window as any).ttq?.page === 'function') {
    (window as any).ttq.page();
    logDebug('TikTok', 'PageView', { url });
  }

  // Snapchat
  if (typeof (window as any).snaptr === 'function') {
    (window as any).snaptr('track', 'PAGE_VIEW');
    logDebug('Snapchat', 'PAGE_VIEW', { url });
  }
};

/**
 * Track ViewContent when a user visits a product detail page
 */
export const trackViewContent = (product: TrackedProduct) => {
  if (typeof window === 'undefined' || !product) return;

  // Send to backend database
  sendEventToBackend('ViewContent', product);

  const value = Number(product.price) || 0;
  const currency = 'EGP';

  // Meta (Facebook)
  if (typeof (window as any).fbq === 'function') {
    (window as any).fbq('track', 'ViewContent', {
      content_name: product.title,
      content_ids: [product.id],
      content_type: 'product',
      value,
      currency,
    });
    logDebug('Meta', 'ViewContent', { id: product.id, title: product.title, value });
  }

  // Google Analytics
  if (typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', 'view_item', {
      currency,
      value,
      items: [{
        item_id: product.id,
        item_name: product.title,
        price: value,
        quantity: 1
      }]
    });
    logDebug('Google', 'view_item', { id: product.id, title: product.title, value });
  }

  // TikTok
  if (typeof (window as any).ttq?.track === 'function') {
    (window as any).ttq.track('ViewContent', {
      contents: [{
        content_id: product.id,
        content_name: product.title,
        content_type: 'product',
        price: value,
        quantity: 1
      }],
      value,
      currency,
    });
    logDebug('TikTok', 'ViewContent', { id: product.id, title: product.title, value });
  }

  // Snapchat
  if (typeof (window as any).snaptr === 'function') {
    (window as any).snaptr('track', 'VIEW_CONTENT', {
      price: value,
      currency,
      item_ids: [product.id]
    });
    logDebug('Snapchat', 'VIEW_CONTENT', { id: product.id, title: product.title, value });
  }
};

/**
 * Track AddToCart when a product is added to cart
 */
export const trackAddToCart = (product: TrackedProduct) => {
  if (typeof window === 'undefined' || !product) return;

  // Send to backend database
  sendEventToBackend('AddToCart', product);

  const value = Number(product.price) || 0;
  const quantity = Number(product.quantity) || 1;
  const totalValue = value * quantity;
  const currency = 'EGP';

  // Meta (Facebook)
  if (typeof (window as any).fbq === 'function') {
    (window as any).fbq('track', 'AddToCart', {
      content_name: product.title,
      content_ids: [product.id],
      content_type: 'product',
      value: totalValue,
      currency,
    });
    logDebug('Meta', 'AddToCart', { id: product.id, title: product.title, value: totalValue, quantity });
  }

  // Google Analytics
  if (typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', 'add_to_cart', {
      currency,
      value: totalValue,
      items: [{
        item_id: product.id,
        item_name: product.title,
        price: value,
        quantity
      }]
    });
    logDebug('Google', 'add_to_cart', { id: product.id, title: product.title, value: totalValue, quantity });
  }

  // TikTok
  if (typeof (window as any).ttq?.track === 'function') {
    (window as any).ttq.track('AddToCart', {
      contents: [{
        content_id: product.id,
        content_name: product.title,
        content_type: 'product',
        price: value,
        quantity
      }],
      value: totalValue,
      currency,
    });
    logDebug('TikTok', 'AddToCart', { id: product.id, title: product.title, value: totalValue, quantity });
  }

  // Snapchat
  if (typeof (window as any).snaptr === 'function') {
    (window as any).snaptr('track', 'ADD_CART', {
      price: totalValue,
      currency,
      item_ids: [product.id]
    });
    logDebug('Snapchat', 'ADD_CART', { id: product.id, title: product.title, value: totalValue });
  }
};

/**
 * Track AddToWishlist when a product is added to wishlist
 */
export const trackAddToWishlist = (product: TrackedProduct) => {
  if (typeof window === 'undefined' || !product) return;

  // Send to backend database
  sendEventToBackend('AddToWishlist', product);

  const value = Number(product.price) || 0;
  const currency = 'EGP';

  // Meta (Facebook)
  if (typeof (window as any).fbq === 'function') {
    (window as any).fbq('track', 'AddToWishlist', {
      content_name: product.title,
      content_ids: [product.id],
      content_type: 'product',
      value,
      currency,
    });
    logDebug('Meta', 'AddToWishlist', { id: product.id, title: product.title, value });
  }

  // Google Analytics
  if (typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', 'add_to_wishlist', {
      currency,
      value,
      items: [{
        item_id: product.id,
        item_name: product.title,
        price: value,
        quantity: 1
      }]
    });
    logDebug('Google', 'add_to_wishlist', { id: product.id, title: product.title, value });
  }

  // TikTok
  if (typeof (window as any).ttq?.track === 'function') {
    (window as any).ttq.track('AddToWishlist', {
      contents: [{
        content_id: product.id,
        content_name: product.title,
        content_type: 'product',
        price: value,
        quantity: 1
      }],
      value,
      currency,
    });
    logDebug('TikTok', 'AddToWishlist', { id: product.id, title: product.title, value });
  }

  // Snapchat
  if (typeof (window as any).snaptr === 'function') {
    (window as any).snaptr('track', 'ADD_TO_WISHLIST', {
      price: value,
      currency,
      item_ids: [product.id]
    });
    logDebug('Snapchat', 'ADD_TO_WISHLIST', { id: product.id, title: product.title, value });
  }
};

/**
 * Track InitiateCheckout when the user begins checking out
 */
export const trackInitiateCheckout = (cart: TrackedProduct[], total: number) => {
  if (typeof window === 'undefined' || !cart || cart.length === 0) return;

  // Send to backend database
  sendEventToBackend('InitiateCheckout', { cart, total });

  const value = Number(total) || 0;
  const currency = 'EGP';
  const itemIds = cart.map(i => i.id);

  // Meta (Facebook)
  if (typeof (window as any).fbq === 'function') {
    (window as any).fbq('track', 'InitiateCheckout', {
      content_ids: itemIds,
      content_type: 'product',
      value,
      currency,
    });
    logDebug('Meta', 'InitiateCheckout', { itemIds, value });
  }

  // Google Analytics
  if (typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', 'begin_checkout', {
      currency,
      value,
      items: cart.map(i => ({
        item_id: i.id,
        item_name: i.title,
        price: Number(i.price) || 0,
        quantity: Number(i.quantity) || 1
      }))
    });
    logDebug('Google', 'begin_checkout', { itemIds, value });
  }

  // TikTok
  if (typeof (window as any).ttq?.track === 'function') {
    (window as any).ttq.track('InitiateCheckout', {
      contents: cart.map(i => ({
        content_id: i.id,
        content_name: i.title,
        content_type: 'product',
        price: Number(i.price) || 0,
        quantity: Number(i.quantity) || 1
      })),
      value,
      currency,
    });
    logDebug('TikTok', 'InitiateCheckout', { itemIds, value });
  }

  // Snapchat
  if (typeof (window as any).snaptr === 'function') {
    (window as any).snaptr('track', 'START_CHECKOUT', {
      price: value,
      currency,
      item_ids: itemIds
    });
    logDebug('Snapchat', 'START_CHECKOUT', { itemIds, value });
  }
};

/**
 * Track Purchase when an order is successfully completed
 */
export const trackPurchase = (order: TrackedOrder) => {
  if (typeof window === 'undefined' || !order) return;

  // Send to backend database
  sendEventToBackend('Purchase', order);

  const value = Number(order.total) || 0;
  const currency = 'EGP';
  const itemIds = order.items.map(i => i.productId);

  // Meta (Facebook)
  if (typeof (window as any).fbq === 'function') {
    (window as any).fbq('track', 'Purchase', {
      content_ids: itemIds,
      content_type: 'product',
      value,
      currency,
    });
    logDebug('Meta', 'Purchase', { transactionId: order.orderNumber, itemIds, value });
  }

  // Google Analytics
  if (typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', 'purchase', {
      transaction_id: order.orderNumber,
      value,
      currency,
      tax: 0,
      shipping: Number(order.shippingFee) || 0,
      items: order.items.map(i => ({
        item_id: i.productId,
        item_name: i.title,
        price: Number(i.price) || 0,
        quantity: Number(i.quantity) || 1
      }))
    });
    logDebug('Google', 'purchase', { transactionId: order.orderNumber, itemIds, value });
  }

  // TikTok
  if (typeof (window as any).ttq?.track === 'function') {
    (window as any).ttq.track('CompletePayment', {
      contents: order.items.map(i => ({
        content_id: i.productId,
        content_name: i.title,
        content_type: 'product',
        price: Number(i.price) || 0,
        quantity: Number(i.quantity) || 1
      })),
      value,
      currency,
    });
    logDebug('TikTok', 'CompletePayment', { transactionId: order.orderNumber, itemIds, value });
  }

  // Snapchat
  if (typeof (window as any).snaptr === 'function') {
    (window as any).snaptr('track', 'PURCHASE', {
      price: value,
      currency,
      transaction_id: order.orderNumber,
      item_ids: itemIds
    });
    logDebug('Snapchat', 'PURCHASE', { transactionId: order.orderNumber, itemIds, value });
  }
};
