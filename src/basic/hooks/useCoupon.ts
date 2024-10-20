import { Coupon } from "../../types.ts";
import { useState } from "react";

export const useCoupons = (initialCoupons: Coupon[]) => {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);

  function handleCouponAdd(newCoupon: Coupon) {
    setCoupons(prevCoupons => [...prevCoupons, newCoupon]);
  };
  return { coupons, addCoupon: handleCouponAdd };
};
