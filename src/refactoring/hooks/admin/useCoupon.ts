import { useState } from 'react';
import { Coupon } from '../../../types';

const DefalutCoupon:Coupon = {
  name: '',
  code: '',
  discountType: 'percentage',
  discountValue: 0
}

export const useCoupon = (onCouponAdd: (coupon: Coupon) => void) => {
  const [newCoupon, setNewCoupon] = useState<Coupon>(DefalutCoupon);

  const handleAddCoupon = () => {
    onCouponAdd(newCoupon);
    setNewCoupon(DefalutCoupon);
  };

  return {
    newCoupon,
    setNewCoupon,
    handleAddCoupon,
  };
};
