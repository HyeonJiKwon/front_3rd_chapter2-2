import { Product } from '../../../types';
import { updateProductFields } from '../utils/adminUtils';

export default function useProductEdit(
  onProductUpdate: (updatedProduct: Product) => void,
  editingProduct:Product | null,
  setEditingProduct: (product: Product | null) => void,
) {

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

  return {
    handleFieldUpdate,
    handleEditProduct,
    handleEditComplete,
  };
};