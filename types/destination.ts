export interface Destination {
  id: string;
  name: string;
  country: string;
  continent: string;
  imageUrl: string;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  popularMonths: string[];
}
