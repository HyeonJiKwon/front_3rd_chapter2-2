import { useState } from 'react';
import { CartItem, Coupon, Product } from '../../../types';
import { calculateCartTotal, updateCartItemQuantity } from '../utils/cartUtils';

const calculateRemainingStock = (cart: CartItem[], product: Product) => {
  const cartItem = cart.find(item => item.product.id === product.id);
  return product.stock - (cartItem?.quantity || 0);
};

const addCartItem = (cart: CartItem[], product: Product): CartItem[] => {
  const remainingStock = calculateRemainingStock(cart, product);
  if (remainingStock <= 0) return cart;

  const existingItem = cart.find(item => item.product.id === product.id);
  if (existingItem) {
    return cart.map(item =>
      item.product.id === product.id
        ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
        : item
    );
  }

  return [...cart, { product, quantity: 1 }];
};

const removeCartItem = (cart: CartItem[], productId: string): CartItem[] => {
  return cart.filter(item => item.product.id !== productId);
};

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  const getRemainingStock = (product: Product) => {
    return calculateRemainingStock(cart, product);
  };

  const addToCart = (product: Product) => {
    setCart(prevCart => addCartItem(prevCart, product));
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => removeCartItem(prevCart, productId));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    setCart(prevCart => updateCartItemQuantity(prevCart, productId, newQuantity));  // 기존 유틸 함수 호출
  };

  const applyCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
  };

  const calculateTotal = () => {
    return calculateCartTotal(cart, selectedCoupon);
  };

  return {
    cart,
    getRemainingStock,
    addToCart,
    removeFromCart,
    updateQuantity,
    applyCoupon,
    calculateTotal,
    selectedCoupon,
  };
};