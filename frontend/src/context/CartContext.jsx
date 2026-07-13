import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';
import useAuth from '../hooks/useAuth';
import { toast } from 'react-hot-toast';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);

  // Load cart on startup or user state change
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      if (user) {
        try {
          // Sync any guest cart items first
          await syncGuestCartWithBackend();
          const { data } = await API.get('/cart');
          if (data?.success) {
            setCart(data.cart);
          }
        } catch (error) {
          console.error('Error fetching cart:', error.message);
        }
      } else {
        // Load guest cart
        const localCart = localStorage.getItem('shopez_cart');
        if (localCart) {
          try {
            setCart(JSON.parse(localCart));
          } catch (e) {
            setCart({ items: [] });
          }
        } else {
          setCart({ items: [] });
        }
      }
      setLoading(false);
    };

    loadCart();
  }, [user]);

  // Save guest cart to localStorage when it changes and user is not logged in
  useEffect(() => {
    if (!user) {
      localStorage.setItem('shopez_cart', JSON.stringify(cart));
      // Dispatch a custom event to notify Navbar and other components
      window.dispatchEvent(new Event('cartUpdated'));
    }
  }, [cart, user]);

  // Sync Guest Cart items to Backend
  const syncGuestCartWithBackend = async () => {
    const localCart = localStorage.getItem('shopez_cart');
    if (!localCart) return;

    try {
      const parsed = JSON.parse(localCart);
      if (parsed.items && parsed.items.length > 0) {
        // Push each item sequentially or batch-upload
        for (const item of parsed.items) {
          // Using the product ID directly since guest items are mock products
          await API.post('/cart', {
            productId: item.product._id || item.product,
            quantity: item.quantity,
          });
        }
        localStorage.removeItem('shopez_cart');
        console.log('✓ Guest cart successfully synced with backend account');
      }
    } catch (error) {
      console.warn('Could not sync guest cart, merging skipped:', error.message);
    }
  };

  // Add Item to Cart
  const addToCart = async (product, quantity = 1) => {
    try {
      if (user) {
        const { data } = await API.post('/cart', {
          productId: product._id,
          quantity,
        });
        if (data?.success) {
          setCart(data.cart);
          toast.success('Item added to cart!');
          return { success: true };
        }
      } else {
        // Guest Cart logic
        const updatedItems = [...cart.items];
        const existIndex = updatedItems.findIndex(
          (item) => item.product._id === product._id
        );

        if (existIndex > -1) {
          updatedItems[existIndex].quantity += quantity;
        } else {
          updatedItems.push({ product, quantity });
        }

        setCart({ items: updatedItems });
        toast.success('Item added to cart (Guest)!');
        return { success: true };
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to add item to cart';
      toast.error(errMsg);
      return { success: false, message: errMsg };
    }
  };

  // Update Item Quantity
  const updateQuantity = async (itemId, quantity) => {
    try {
      if (user) {
        const { data } = await API.put(`/cart/${itemId}`, { quantity });
        if (data?.success) {
          setCart(data.cart);
          return { success: true };
        }
      } else {
        // Guest Cart logic
        const updatedItems = cart.items.map((item) => {
          if (item.product._id === itemId) {
            return { ...item, quantity };
          }
          return item;
        });
        setCart({ items: updatedItems });
        return { success: true };
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to update quantity';
      toast.error(errMsg);
      return { success: false, message: errMsg };
    }
  };

  // Remove Item
  const removeFromCart = async (itemId) => {
    try {
      if (user) {
        const { data } = await API.delete(`/cart/${itemId}`);
        if (data?.success) {
          setCart(data.cart);
          toast.success('Item removed from cart');
          return { success: true };
        }
      } else {
        // Guest Cart logic
        const updatedItems = cart.items.filter(
          (item) => item.product._id !== itemId
        );
        setCart({ items: updatedItems });
        toast.success('Item removed from cart');
        return { success: true };
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to remove item';
      toast.error(errMsg);
      return { success: false, message: errMsg };
    }
  };

  // Clear Cart
  const clearCart = async () => {
    try {
      if (user) {
        const { data } = await API.delete('/cart');
        if (data?.success) {
          setCart(data.cart);
          return { success: true };
        }
      } else {
        setCart({ items: [] });
        return { success: true };
      }
    } catch (error) {
      toast.error('Failed to clear cart');
      return { success: false };
    }
  };

  const getCartTotal = () => {
    return cart.items.reduce((total, item) => {
      const price = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
      return total + price * item.quantity;
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
