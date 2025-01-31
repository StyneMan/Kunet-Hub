export enum OrderStatus {
  REJECTED = 'rejected', // Vendor rejects a customer order
  PROCESSING = 'processing', // Vendor has accepted order
  PENDING = 'pending', // Customer has place order but it is still pending
  READY_FOR_DELIVERY = 'ready_for_delivery', // To be assigned to rider/waiting for rider to arrive
  RIDER_ACCEPTED = 'rider_accepted', // To be assigned to rider/waiting for rider to arrive
  RIDER_PICKED_ORDER = 'rider_picked_order', // To be assigned to rider/waiting for rider to arrive
  RIDER_ARRIVED_VENDOR = 'rider_arrived_vendor', // To be assigned to rider/waiting for rider to arrive
  RIDER_ARRIVED_CUSTOMER = 'rider_arrived_customer', // To be assigned to rider/waiting for rider to arrive
  READY_FOR_PICKUP = 'ready_for_pickup', // Waiting for customer to pick up order
  IN_DELIVERY = 'in_delivery', // Rider on his/her way to deliver
  DELIVERED = 'delivered', // Delivered to customer
  CANCELLED = 'cancelled', // Cancelled by customer
  COMPLETED = 'completed',
}
