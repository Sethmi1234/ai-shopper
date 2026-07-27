export interface AddItemDto {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  thumbnail: string;
}

export interface UpdateItemDto {
  quantity: number;
}

export interface CartResultDto {
  items: any[];
}
