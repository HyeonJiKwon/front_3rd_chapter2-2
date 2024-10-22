import { useState } from 'react';
import { Product, Discount } from '../../../types';
import { addDiscountToProduct, removeDiscountFromProduct } from '../utils/adminUtils';

export const useDiscount = (
  products: Product[],
  onProductUpdate: (product: Product) => void,
  setEditingProduct: (product: Product) => void
) => {
  const [newDiscount, setNewDiscount] = useState<Discount>({ quantity: 0, rate: 0 });

  const handleAddDiscount = (productId: string) => {
    const productToUpdate = products.find(p => p.id === productId);
    if (productToUpdate) {
      const updatedProduct = addDiscountToProduct(productToUpdate, newDiscount);
      onProductUpdate(updatedProduct);
      setEditingProduct(updatedProduct);
      setNewDiscount({ quantity: 0, rate: 0 });
    }
  };

  const handleRemoveDiscount = (productId: string, index: number) => {
    const productToUpdate = products.find(p => p.id === productId);
    if (productToUpdate) {
      const updatedProduct = removeDiscountFromProduct(productToUpdate, index);
      onProductUpdate(updatedProduct);
      setEditingProduct(updatedProduct);
    }
  };

  return {
    newDiscount,
    setNewDiscount,
    handleAddDiscount,
    handleRemoveDiscount,
  };
};