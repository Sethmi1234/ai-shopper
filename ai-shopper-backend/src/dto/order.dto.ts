export interface OrderResultDto {
  message: string;
  order: any;
}

export interface PaginationInfoDto {
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  limit: number;
}

export interface OrdersListResultDto {
  orders: any[];
  pagination: PaginationInfoDto;
}
