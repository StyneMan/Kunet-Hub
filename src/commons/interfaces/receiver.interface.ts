export interface ReceiverI {
  name: string;
  phone: string;
  email: string;
  address: string;
  location: Coordinates;
}

type Coordinates = {
  lat: number;
  lng: number;
};
