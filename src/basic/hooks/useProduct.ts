import { useState } from 'react';
import { Product } from '../../types.ts';

export const useProducts = (initialProducts: Product[]) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  function handleProductUpdate(updatedProduct: Product) {
    setProducts(prevProducts =>
      prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    );
  };

  function handleProductAdd(newProduct: Product) {
    setProducts(prevProducts => [...prevProducts, newProduct]);
  };

  console.log(products)
  return { products, updateProduct: handleProductUpdate, addProduct: handleProductAdd };
};
