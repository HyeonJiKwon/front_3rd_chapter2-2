import { useState } from 'react';
import { Product } from '../../../types';
import { createNewProduct } from '../utils/adminUtils';

const DEFAULT_PRODUCT = {
  name: '',
  price: 0,
  stock: 0,
  discounts: []
};

export default function useProductAdd(
  onProductAdd: (newProduct: Product) => void,
  setShowNewProductForm: (showNewProductForm: boolean) => void,
) {

  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>(DEFAULT_PRODUCT);

  // 새로운 상품 추가
  const handleAddNewProduct = () => {
    const newProductWithId = createNewProduct(newProduct);
    onProductAdd(newProductWithId);
    setNewProduct(DEFAULT_PRODUCT);
    setShowNewProductForm(false);
  };

  return {
    newProduct,
    setNewProduct,
    handleAddNewProduct,
  };
};