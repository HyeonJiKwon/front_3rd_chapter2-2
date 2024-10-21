import { Product, Discount } from '../../../types';

// 상품 업데이트
export const updateProductFields = (
  product: Product,
  updatedFields: Partial<Product>
): Product => {
  return { ...product, ...updatedFields };
};

// 상품에 할인 추가 함수
export const addDiscountToProduct = (product: Product, newDiscount: Discount): Product => {
  return { ...product, discounts: [...product.discounts, newDiscount] };
};

// 상품에서 할인 제거 함수
export const removeDiscountFromProduct = (product: Product, index: number): Product => {
  return {
    ...product,
    discounts: product.discounts.filter((_, i) => i !== index),
  };
};

// 새 상품 생성 함수
export const createNewProduct = (newProductData: Omit<Product, 'id'>): Product => {
  return { ...newProductData, id: Date.now().toString() };
};