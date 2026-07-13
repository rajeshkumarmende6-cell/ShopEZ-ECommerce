import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';
import useAuth from '../hooks/useAuth';
import { toast } from 'react-hot-toast';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState({ products: [] });
  const [loading, setLoading] = useState(true);

  // Load wishlist on startup or user change
  useEffect(() => {
    const loadWishlist = async () => {
      setLoading(true);
      if (user) {
        try {
          await syncGuestWishlist();
          const { data } = await API.get('/wishlist');
          if (data?.success) {
            setWishlist(data.wishlist);
          }
        } catch (error) {
          console.error('Error fetching wishlist:', error.message);
        }
      } else {
        const localWish = localStorage.getItem('shopez_wishlist');
        if (localWish) {
          try {
            setWishlist(JSON.parse(localWish));
          } catch (e) {
            setWishlist({ products: [] });
          }
        } else {
          setWishlist({ products: [] });
        }
      }
      setLoading(false);
    };
    loadWishlist();
  }, [user]);

  // Sync wishlist to localStorage for guest
  useEffect(() => {
    if (!user) {
      localStorage.setItem('shopez_wishlist', JSON.stringify(wishlist));
      window.dispatchEvent(new Event('wishlistUpdated'));
    }
  }, [wishlist, user]);

  const syncGuestWishlist = async () => {
    const localWish = localStorage.getItem('shopez_wishlist');
    if (!localWish) return;

    try {
      const parsed = JSON.parse(localWish);
      if (parsed.products && parsed.products.length > 0) {
        for (const prod of parsed.products) {
          const prodId = prod._id || prod;
          await API.post('/wishlist/toggle', { productId: prodId });
        }
        localStorage.removeItem('shopez_wishlist');
        console.log('✓ Guest wishlist successfully synced');
      }
    } catch (err) {
      console.warn('Failed to sync guest wishlist:', err.message);
    }
  };

  // Toggle item in wishlist
  const toggleWishlist = async (product) => {
    const productId = product._id;
    try {
      if (user) {
        const { data } = await API.post('/wishlist/toggle', { productId });
        if (data?.success) {
          setWishlist(data.wishlist);
          toast.success(data.message || 'Wishlist updated');
          return { success: true };
        }
      } else {
        // Guest mode logic
        const exists = wishlist.products.some((p) => p._id === productId);
        let updatedProducts = [];
        let message = '';

        if (exists) {
          updatedProducts = wishlist.products.filter((p) => p._id !== productId);
          message = 'Product removed from wishlist';
        } else {
          updatedProducts = [...wishlist.products, product];
          message = 'Product added to wishlist';
        }

        setWishlist({ products: updatedProducts });
        toast.success(message);
        return { success: true };
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to update wishlist';
      toast.error(errMsg);
      return { success: false, message: errMsg };
    }
  };

  const inWishlist = (productId) => {
    return wishlist.products.some((p) => (p._id || p) === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, loading, toggleWishlist, inWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
