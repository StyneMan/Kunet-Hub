import SelectionItemI from './selection.item';

export default interface OrderItemI {
  price?: number;
  quantity: number;
  weight?: number;
  dimen?: string;
  name: string;
  images: string[];
  productId?: string;
  selections?: SelectionItemI[];
}
