import { useState } from "react";
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { act, fireEvent, render, renderHook, screen, within } from '@testing-library/react';
import { CartPage } from '../../refactoring/components/CartPage';
import { AdminPage } from "../../refactoring/components/admin/AdminPage";
import { Coupon, Discount, Product } from '../../types';
import { useCoupon, useDiscount, useProductAdd,useProductEdit } from "../../refactoring/hooks/admin";
import { AccordionProvider, useAccordion } from "../../refactoring/context/AccodionContext";
import { addDiscountToProduct, createNewProduct, getProductToUpdate, removeDiscountFromProduct, updateProductFields } from "../../refactoring/hooks/utils/adminUtils";

const mockProducts: Product[] = [
  {
    id: 'p1',
    name: '상품1',
    price: 10000,
    stock: 20,
    discounts: [{ quantity: 10, rate: 0.1 }]
  },
  {
    id: 'p2',
    name: '상품2',
    price: 20000,
    stock: 20,
    discounts: [{ quantity: 10, rate: 0.15 }]
  },
  {
    id: 'p3',
    name: '상품3',
    price: 30000,
    stock: 20,
    discounts: [{ quantity: 10, rate: 0.2 }]
  }
];
// mock 데이터
const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  price: 1000,
  stock: 10,
  discounts: [{ quantity: 30, rate: 0.3 },{ quantity: 10, rate: 0.2 }],
};
// mock new 상품데이터
const mockNewProduct = {
  name: 'New Product',
  price: 100,
  stock: 5,
  discounts: [{ quantity: 30, rate: 0.3 }]
};

const mockCoupons: Coupon[] = [
  {
    name: '5000원 할인 쿠폰',
    code: 'AMOUNT5000',
    discountType: 'amount',
    discountValue: 5000
  },
  {
    name: '10% 할인 쿠폰',
    code: 'PERCENT10',
    discountType: 'percentage',
    discountValue: 10
  }
];

const TestAdminPage = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons);


  const handleProductUpdate = (updatedProduct: Product) => {
    setProducts(prevProducts =>
      prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    );
  };

  const handleProductAdd = (newProduct: Product) => {
    setProducts(prevProducts => [...prevProducts, newProduct]);
  };

  const handleCouponAdd = (newCoupon: Coupon) => {
    setCoupons(prevCoupons => [...prevCoupons, newCoupon]);
  };

  return (
    <AdminPage
      products={products}
      coupons={coupons}
      onProductUpdate={handleProductUpdate}
      onProductAdd={handleProductAdd}
      onCouponAdd={handleCouponAdd}
    />
  );
};

describe('advanced > ', () => {

  describe('시나리오 테스트 > ', () => {

    test('장바구니 페이지 테스트 > ', async () => {

      render(<CartPage products={mockProducts} coupons={mockCoupons}/>);
      const product1 = screen.getByTestId('product-p1');
      const product2 = screen.getByTestId('product-p2');
      const product3 = screen.getByTestId('product-p3');
      const addToCartButtonsAtProduct1 = within(product1).getByText('장바구니에 추가');
      const addToCartButtonsAtProduct2 = within(product2).getByText('장바구니에 추가');
      const addToCartButtonsAtProduct3 = within(product3).getByText('장바구니에 추가');

      // 1. 상품 정보 표시
      expect(product1).toHaveTextContent('상품1');
      expect(product1).toHaveTextContent('10,000원');
      expect(product1).toHaveTextContent('재고: 20개');
      expect(product2).toHaveTextContent('상품2');
      expect(product2).toHaveTextContent('20,000원');
      expect(product2).toHaveTextContent('재고: 20개');
      expect(product3).toHaveTextContent('상품3');
      expect(product3).toHaveTextContent('30,000원');
      expect(product3).toHaveTextContent('재고: 20개');


      // 2. 할인 정보 표시
      expect(screen.getByText('10개 이상: 10% 할인')).toBeInTheDocument();

      // 3. 상품1 장바구니에 상품 추가
      fireEvent.click(addToCartButtonsAtProduct1); // 상품1 추가

      // 4. 할인율 계산
      expect(screen.getByText('상품 금액: 10,000원')).toBeInTheDocument();
      expect(screen.getByText('할인 금액: 0원')).toBeInTheDocument();
      expect(screen.getByText('최종 결제 금액: 10,000원')).toBeInTheDocument();

      // 5. 상품 품절 상태로 만들기
      for (let i = 0; i < 19; i++) {
        fireEvent.click(addToCartButtonsAtProduct1);
      }

      // 6. 품절일 때 상품 추가 안 되는지 확인하기
      expect(product1).toHaveTextContent('재고: 0개');
      fireEvent.click(addToCartButtonsAtProduct1);
      expect(product1).toHaveTextContent('재고: 0개');

      // 7. 할인율 계산
      expect(screen.getByText('상품 금액: 200,000원')).toBeInTheDocument();
      expect(screen.getByText('할인 금액: 20,000원')).toBeInTheDocument();
      expect(screen.getByText('최종 결제 금액: 180,000원')).toBeInTheDocument();

      // 8. 상품을 각각 10개씩 추가하기
      fireEvent.click(addToCartButtonsAtProduct2); // 상품2 추가
      fireEvent.click(addToCartButtonsAtProduct3); // 상품3 추가

      const increaseButtons = screen.getAllByText('+');
      for (let i = 0; i < 9; i++) {
        fireEvent.click(increaseButtons[1]); // 상품2
        fireEvent.click(increaseButtons[2]); // 상품3
      }

      // 9. 할인율 계산
      expect(screen.getByText('상품 금액: 700,000원')).toBeInTheDocument();
      expect(screen.getByText('할인 금액: 110,000원')).toBeInTheDocument();
      expect(screen.getByText('최종 결제 금액: 590,000원')).toBeInTheDocument();

      // 10. 쿠폰 적용하기
      const couponSelect = screen.getByRole('combobox');
      fireEvent.change(couponSelect, { target: { value: '1' } }); // 10% 할인 쿠폰 선택

      // 11. 할인율 계산
      expect(screen.getByText('상품 금액: 700,000원')).toBeInTheDocument();
      expect(screen.getByText('할인 금액: 169,000원')).toBeInTheDocument();
      expect(screen.getByText('최종 결제 금액: 531,000원')).toBeInTheDocument();

      // 12. 다른 할인 쿠폰 적용하기
      fireEvent.change(couponSelect, { target: { value: '0' } }); // 5000원 할인 쿠폰
      expect(screen.getByText('상품 금액: 700,000원')).toBeInTheDocument();
      expect(screen.getByText('할인 금액: 115,000원')).toBeInTheDocument();
      expect(screen.getByText('최종 결제 금액: 585,000원')).toBeInTheDocument();
    });

    test('관리자 페이지 테스트 > ', async () => {
      render(<TestAdminPage/>);


      const $product1 = screen.getByTestId('product-1');

      // 1. 새로운 상품 추가
      fireEvent.click(screen.getByText('새 상품 추가'));

      fireEvent.change(screen.getByLabelText('상품명'), { target: { value: '상품4' } });
      fireEvent.change(screen.getByLabelText('가격'), { target: { value: '15000' } });
      fireEvent.change(screen.getByLabelText('재고'), { target: { value: '30' } });

      fireEvent.click(screen.getByText('추가'));

      const $product4 = screen.getByTestId('product-4');

      expect($product4).toHaveTextContent('상품4');
      expect($product4).toHaveTextContent('15000원');
      expect($product4).toHaveTextContent('재고: 30');

      // 2. 상품 선택 및 수정
      fireEvent.click($product1);
      fireEvent.click(within($product1).getByTestId('toggle-button'));
      fireEvent.click(within($product1).getByTestId('modify-button'));


      act(() => {
        fireEvent.change(within($product1).getByDisplayValue('20'), { target: { value: '25' } });
        fireEvent.change(within($product1).getByDisplayValue('10000'), { target: { value: '12000' } });
        fireEvent.change(within($product1).getByDisplayValue('상품1'), { target: { value: '수정된 상품1' } });
      })

      fireEvent.click(within($product1).getByText('수정 완료'));

      expect($product1).toHaveTextContent('수정된 상품1');
      expect($product1).toHaveTextContent('12000원');
      expect($product1).toHaveTextContent('재고: 25');

      // 3. 상품 할인율 추가 및 삭제
      fireEvent.click($product1);
      fireEvent.click(within($product1).getByTestId('modify-button'));

      // 할인 추가
      act(() => {
        fireEvent.change(screen.getByPlaceholderText('수량'), { target: { value: '5' } });
        fireEvent.change(screen.getByPlaceholderText('할인율 (%)'), { target: { value: '5' } });
      })
      fireEvent.click(screen.getByText('할인 추가'));

      expect(screen.queryByText('5개 이상 구매 시 5% 할인')).toBeInTheDocument();

      // 할인 삭제
      fireEvent.click(screen.getAllByText('삭제')[0]);
      expect(screen.queryByText('10개 이상 구매 시 10% 할인')).not.toBeInTheDocument();
      expect(screen.queryByText('5개 이상 구매 시 5% 할인')).toBeInTheDocument();

      fireEvent.click(screen.getAllByText('삭제')[0]);
      expect(screen.queryByText('10개 이상 구매 시 10% 할인')).not.toBeInTheDocument();
      expect(screen.queryByText('5개 이상 구매 시 5% 할인')).not.toBeInTheDocument();

      // 4. 쿠폰 추가
      fireEvent.change(screen.getByPlaceholderText('쿠폰 이름'), { target: { value: '새 쿠폰' } });
      fireEvent.change(screen.getByPlaceholderText('쿠폰 코드'), { target: { value: 'NEW10' } });
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'percentage' } });
      fireEvent.change(screen.getByPlaceholderText('할인 값'), { target: { value: '10' } });

      fireEvent.click(screen.getByText('쿠폰 추가'));

      const $newCoupon = screen.getByTestId('coupon-3');

      expect($newCoupon).toHaveTextContent('새 쿠폰 (NEW10):10% 할인');
    })
  })
  describe('관리자 페이지 기능 테스트 ', () => {
    describe('커스텀 훅 & context 테스트', () => {
      const TestAccordionComponent = () => {
        const { openProductIds, toggleProductAccordion } = useAccordion();
        
        return (
          <div>
            <button onClick={() => toggleProductAccordion('product-1')}>
              Toggle Product 1
            </button>
            <div data-testid="product-status">
              {openProductIds.has('product-1') ? 'Open' : 'Closed'}
            </div>
          </div>
        );
      };

      describe('AccordionContext', () => {
        test('Context를 정상적으로 제공했을 때의 테스트', () => {
          render(
            <AccordionProvider>
              <TestAccordionComponent />
            </AccordionProvider>
          );
          
          const productStatus = screen.getByTestId('product-status');
          const toggleButton = screen.getByText('Toggle Product 1');
          
          // 초기 상태는 'Closed'여야 함
          expect(productStatus.textContent).toBe('Closed');
          
          // 버튼 클릭 후 'Open'으로 상태가 변경되어야 함
          fireEvent.click(toggleButton);
          expect(productStatus.textContent).toBe('Open');
          
          // 다시 클릭하면 'Closed'로 돌아가야 함
          fireEvent.click(toggleButton);
          expect(productStatus.textContent).toBe('Closed');
        });

        test('Context 없이 사용할 때의 에러 발생 여부 테스트', () => {
          const renderWithoutProvider = () => render(<TestAccordionComponent />);
          // AccordionProvider 없이 사용하면 에러가 발생해야 함
          expect(renderWithoutProvider).toThrowError('useAccordion must be used within an AccordionProvider');
        });
      });


      // mock 함수 생성
      const onProductUpdate = vi.fn();
      const onProductAdd = vi.fn();

    
      const DEFAULT_PRODUCT = {
        name: '',
        price: 0,
        stock: 0,
        discounts: []
      };

      describe('useProductEdit : 상품 편집 훅의 테스트', () => {
        // 실제 상태 변화가 일어나는 setEditingProduct 구현
        let editingProduct = mockProduct as Product | null;
        const setEditingProduct = (product: Product | null) => {
          editingProduct = product;
        };
        const { result } = renderHook(() =>
          useProductEdit(onProductUpdate, editingProduct, setEditingProduct)
        );

          test('상품이 실제로 수정되었는지 확인', () => {
          act(() => {
            result.current.handleFieldUpdate('1', { name: 'Updated Product' });
          });

          // 상태가 실제로 수정되었는지 확인
          expect(editingProduct).toEqual({
            ...mockProduct,
            name: 'Updated Product'
          });
        });

        test('상품이 null로 초기화되었는지 확인', () => {
          act(() => {
            result.current.handleEditComplete();
          });

          // 상태가 null로 초기화되었는지 확인
          expect(editingProduct).toBeNull();
        });
      });

      describe('useProductAdd : 상품 추가 훅의 테스트', () => {
        const setShowNewProductForm = vi.fn()
        const { result } = renderHook(() =>
          useProductAdd(onProductAdd, setShowNewProductForm)
        );

        test('상품 추가 필드가 열렸을 때, 상품이 초기화 되어있는지 확인', () => {

          expect(result.current.newProduct).toEqual(DEFAULT_PRODUCT);

        });

        test('상품이 실제로 추가 되었는지 확인', () => {
          //상태 업데이트는 비동기적으로 일어나므로, 한 번 렌더링 후 다시 상태를 확인
          const { result } = renderHook(() =>
            useProductAdd(onProductAdd, setShowNewProductForm)
          );

          // act로 상품 정보를 설정 후 상품 추가 함수 호출
          act(() => {
            result.current.setNewProduct(mockNewProduct); // 상품 정보 설정
          });

          // 상태가 변경되었는지 확인
          expect(result.current.newProduct).toEqual(mockNewProduct); // 상태가 업데이트 되었는지 확인

          // 상품 추가 실행
          act(() => {
            result.current.handleAddNewProduct(); // 상품 추가 함수 호출
          });

          // onProductAdd가 호출되었는지 확인
          expect(onProductAdd).toHaveBeenCalledTimes(1);
          expect(onProductAdd.mock.calls[0][0]).toMatchObject(mockNewProduct);

          // 상품 추가 후 newProduct가 DEFAULT_PRODUCT로 초기화되었는지 확인
          expect(result.current.newProduct).toEqual(DEFAULT_PRODUCT);

          // 상품 추가 후 폼이 닫혔는지 확인
          expect(setShowNewProductForm).toHaveBeenCalledWith(false);
        });
      });

      describe('useDiscount : 상품의 할인 관리 훅의 테스트', () => {
        beforeEach(() => {
          vi.clearAllMocks(); // 테스트 실행 전에 mock 함수 초기화
        });
        const setEditingProduct = vi.fn();
        const newDiscount: Discount = { quantity: 3, rate: 0.1 };
        const DEFAULT_DISCOUNT: Discount = { quantity: 0, rate: 0 };

        const { result } = renderHook(() =>
          useDiscount(mockProducts,onProductUpdate, setEditingProduct)
        );

        test('각 상품의 할인 정보 추가 시 상품 정보가 업데이트 되는지 확인', () => {
          const { result } = renderHook(() =>
            useDiscount(mockProducts,onProductUpdate, setEditingProduct)
          );

          act(() => {
            result.current.setNewDiscount(newDiscount); // 새로운 할인 설정
          });

          expect(result.current.newDiscount).toEqual(newDiscount); // 추가된 할인 정보 확인

          act(() => {
            result.current.handleAddDiscount('p1'); // 상품 할인 추가 함수 호출
          });
          // onProductUpdate 및 setEditingProduct가 호출되었는지 확인
          expect(onProductUpdate).toHaveBeenCalledTimes(1);
          expect(setEditingProduct).toHaveBeenCalledTimes(1);

          // onProductUpdate가 호출된 인자 값이 업데이트된 상품인지 확인
          const updatedProduct = onProductUpdate.mock.calls[0][0];
          expect(updatedProduct.discounts).toContainEqual(newDiscount); // 추가된 할인 정보 확인
          expect(result.current.newDiscount).toEqual(DEFAULT_DISCOUNT);

        });

        test('각 상품의 할인 정보 삭제 시 상품 정보가 업데이트 되는지 확인', () => {
          // 할인 정보 삭제
          act(() => {
            result.current.handleRemoveDiscount('p1', 0); // p1에서 첫 번째 할인 삭제
          });

          expect(onProductUpdate).toHaveBeenCalledTimes(1);
          expect(setEditingProduct).toHaveBeenCalledTimes(1);

          // 할인 정보가 삭제된 상태로 업데이트되었는지 확인
          const updatedProduct = onProductUpdate.mock.calls[0][0];
          expect(updatedProduct.discounts).toEqual([]); // 할인이 없는지 확인
        });
      })

      describe('useCoupon : 쿠폰 관리 훅의 테스트', () => {
        const onCouponAdd = vi.fn();
        const newCoupon: Coupon = {
          name: '새로운 쿠폰1',
          code: '0309',
          discountType: 'amount',
          discountValue: 3
        };
        const DEFAULT_COUPON: Coupon = {
          name: '',
          code: '',
          discountType: 'percentage',
          discountValue: 0
        };

        const { result } = renderHook(() =>
          useCoupon(onCouponAdd)
        );

        test('쿠폰이 추가되는지 확인', () => {
          act(() => {
            result.current.setNewCoupon(newCoupon); 
          });

          expect(result.current.newCoupon).toEqual(DEFAULT_COUPON);
          
          act(() => {
            result.current.handleAddCoupon();
          });
          expect(onCouponAdd).toHaveBeenCalledTimes(1);
          expect(result.current.newCoupon).toEqual(DEFAULT_COUPON);

        });
      });
    })


    describe('utils 함수 테스트', () => {
      describe('상품 업데이트 함수(updateProductFields)가 정상 작동하는지 확인', () => {
        test('name 변경확인',()=>{
          const updateName = 'updateName';
          const updatedProduct = updateProductFields(mockProduct, { name: updateName });
          expect(updatedProduct.name).toEqual(updateName);
        })
        
        test('price 변경확인',()=>{
          const updatePrice = 15000;
          // 1000 -> 15000
          const updatedProduct = updateProductFields(mockProduct, { price: updatePrice });
          expect(updatedProduct.price).toEqual(updatePrice);
        })

        test('stock 변경확인',()=>{
          const updateStock = 100;
          // 10-> 100
          const updatedProduct = updateProductFields(mockProduct, { stock: updateStock });
          expect(updatedProduct.stock).toEqual(updateStock);
        })

      });
      
      test('상품에 할인 정보 추가 함수(addDiscountToProduct)가 정상 작동하는지 확인', () => {
        const newDiscount = { quantity: 10, rate: 0.1 };
        const updatedProduct = addDiscountToProduct(mockProduct, newDiscount);
        expect(updatedProduct.discounts).toContainEqual(newDiscount);
      });

      test('상품에서 할인 제거 함수(removeDiscountFromProduct)가 정상 작동하는지 확인', () => {
         // 인덱스 1의 할인 제거
        const updatedProduct = removeDiscountFromProduct(mockProduct, 1);

        // 새로운 discounts 배열에 할인 항목이 제거되었는지 확인
        expect(updatedProduct.discounts).toHaveLength(1);
        expect(updatedProduct.discounts).toEqual([{ quantity: 30, rate: 0.3 }]); // 인덱스 0만 남아 있어야 함
      });

      test('새 상품 생성 함수(createNewProduct)가 정상 작동하는지 확인', () => {
         // Date.now()를 mock 처리하여 고정된 id 생성
        const mockDate = 1630000000000; // 고정된 날짜 값을 설정
        vi.spyOn(Date, 'now').mockReturnValue(mockDate);

        // createNewProduct 함수 실행
        const newProduct = createNewProduct(mockNewProduct);

        // 새로운 상품에 id가 제대로 추가되었는지 확인
        expect(newProduct.id).toBe(mockDate.toString());
        expect(newProduct).toEqual({ ...mockNewProduct, id: mockDate.toString() });
      });

      describe('특정 상품 찾기 함수(getProductToUpdate)가 정상 작동하는지 확인', () => {
        test('상품이 존재할 경우', () => {
          const findProduct = getProductToUpdate(mockProducts, 'p1');
          
          expect(findProduct).not.toBeUndefined(); // 상품이 존재하는지 확인
          expect(findProduct?.id).toEqual('p1');   // 상품의 id가 맞는지 확인
        });
      
        // 상품을 찾지 못하는 경우
        test('찾는 상품이 없는 경우', () => {
          const findProduct = getProductToUpdate(mockProducts, 'p10'); // 존재하지 않는 상품 ID
          expect(findProduct).toBeUndefined(); // undefined 반환 여부 확인
        });
      });
    })
  })
})
