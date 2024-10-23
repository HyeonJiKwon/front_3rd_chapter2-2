import { useState } from 'react';
import { Product, Discount } from '../../../types';
import { addDiscountToProduct, getProductToUpdate, removeDiscountFromProduct } from '../utils/adminUtils';

export default function useDiscount(
  products: Product[],
  onProductUpdate: (product: Product) => void,
  setEditingProduct: (product: Product) => void
) {
  const [newDiscount, setNewDiscount] = useState<Discount>({ quantity: 0, rate: 0 });
  
  const updateDiscountForProduct= (updatedProduct:Product) =>{
    onProductUpdate(updatedProduct);
    setEditingProduct(updatedProduct);
  }

  const handleAddDiscount = (productId: string) => {
    const productToUpdate = getProductToUpdate(products, productId);
    if (productToUpdate) {
      const updatedProduct = addDiscountToProduct(productToUpdate, newDiscount);
      updateDiscountForProduct(updatedProduct);
      setNewDiscount({ quantity: 0, rate: 0 });
    }
  };

  const handleRemoveDiscount = (productId: string, index: number) => {
    const productToUpdate = getProductToUpdate(products, productId);
    if (productToUpdate) {
      const updatedProduct = removeDiscountFromProduct(productToUpdate, index);
      updateDiscountForProduct(updatedProduct);
    }
  };

  return {
    newDiscount,
    setNewDiscount,
    handleAddDiscount,
    handleRemoveDiscount,
  };
};