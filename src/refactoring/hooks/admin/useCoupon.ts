import { useState } from 'react';
import { Coupon } from '../../../types';

const DEFAULT_COUPON: Coupon = {
  name: '',
  code: '',
  discountType: 'percentage',
  discountValue: 0
};

export default function useCoupon(onCouponAdd: (coupon: Coupon) => void) {
  const [newCoupon, setNewCoupon] = useState<Coupon>(DEFAULT_COUPON);

  const handleAddCoupon = () => {
    onCouponAdd(newCoupon);
    setNewCoupon(DEFAULT_COUPON);
  };

  return {
    newCoupon,
    setNewCoupon,
    handleAddCoupon,
  };
};
