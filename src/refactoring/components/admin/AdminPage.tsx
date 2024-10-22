import { AccordionProvider } from '../../context/AccodionContext';
import { AdminCoupon } from './AdminCoupon';
import { AdminProduct } from './AdminPropduct';
import { CouponProps, ProductProps } from './types';

export const AdminPage = ({ products, coupons, onProductUpdate, onProductAdd, onCouponAdd }: CouponProps & ProductProps) => {
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">관리자 페이지</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AccordionProvider>
            <AdminProduct 
              products={products} 
              onProductUpdate={onProductUpdate} 
              onProductAdd={onProductAdd}
            />
        </AccordionProvider>

        <AdminCoupon 
          coupons={coupons}
          onCouponAdd={onCouponAdd}
        />
      </div>
    </div>
  );
};
