import { Coupon, Product } from "../../../types";

export interface ProductProps {
  products: Product[];
  onProductUpdate: (updatedProduct: Product) => void;
  onProductAdd: (newProduct: Product) => void;
}

export interface CouponProps {
  coupons: Coupon[];
  onCouponAdd: (newCoupon: Coupon) => void;
}