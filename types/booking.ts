export type BookingStatus = 'confirmed' | 'pending' | 'cancelled';

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  destination: string;
  packageName: string;
  departureDate: string;
  returnDate: string;
  amount: number;
  status: BookingStatus;
  createdAt: string;
  travelers: number;
}
