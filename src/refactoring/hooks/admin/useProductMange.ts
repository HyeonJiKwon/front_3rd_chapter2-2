import { useState } from 'react';
import { Product } from '../../../types';
import { updateProductFields, createNewProduct } from '../utils/adminUtils';

export const useProductManage = (
  onProductUpdate: (updatedProduct: Product) => void,
  onProductAdd: (newProduct: Product) => void,
  editingProduct:Product | null,
  setEditingProduct: (product: Product | null) => void,
) => {
  // const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    price: 0,
    stock: 0,
    discounts: [],
  });
  const [showNewProductForm, setShowNewProductForm] = useState(false);

  // 공통 상품 필드 업데이트
  const handleFieldUpdate = (productId: string, fields: Partial<Product>) => {
    if (editingProduct && editingProduct.id === productId) {
      const updatedProduct = updateProductFields(editingProduct, fields);
      setEditingProduct(updatedProduct);
    }
  };

  // 상품 편집 시작
  const handleEditProduct = (product: Product) => {
    setEditingProduct({ ...product });
  };

  // 상품 편집 완료
  const handleEditComplete = () => {
    if (editingProduct) {
      onProductUpdate(editingProduct);
      setEditingProduct(null);
    }
  };

  // 새로운 상품 추가
  const handleAddNewProduct = () => {
    const newProductWithId = createNewProduct(newProduct);
    onProductAdd(newProductWithId);
    setNewProduct({
      name: '',
      price: 0,
      stock: 0,
      discounts: [],
    });
    setShowNewProductForm(false);
  };

  return {
    // editingProduct,
    newProduct,
    showNewProductForm,
    setShowNewProductForm,
    setNewProduct,
    handleFieldUpdate,
    handleEditProduct,
    handleEditComplete,
    handleAddNewProduct,
  };
};