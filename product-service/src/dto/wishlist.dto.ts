export interface AddWishlistItemDto {
  productId: string;
  title: string;
  price: number;
  thumbnail: string;
}

export interface WishlistResultDto {
  products: any[];
}
