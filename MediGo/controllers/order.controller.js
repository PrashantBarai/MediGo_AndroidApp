const placedOrder = await Order.create({
  ...orderData,
  orderStatus: 'placed',
  paymentStatus: 'pending',
  orderDate: new Date().toISOString(),
});

const completedPaymentOrder = await Order.create({
  ...orderData,
  orderStatus: 'placed',
  paymentStatus: 'completed',
  orderDate: new Date().toISOString(),
});

const newPlacedOrder = await Order.create({
  ...orderData,
  orderStatus: 'placed',
  paymentStatus: 'pending',
  orderDate: new Date().toISOString(),
}); 