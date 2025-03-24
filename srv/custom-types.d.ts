import { Request as BaseRequest } from '@sap/cds/apis/services';

declare module '@sap/cds' {
  interface Request extends BaseRequest {
    i18n: {
      t: (key: string, args?: any[]) => string;
    };
  }
}

export type Product = {
  ID?: string;
  productName: string;
  description?: string;
  price: number;
  currency?: string;
  category?: string;
  stockQuantity: number;
  status?: string;
  supplier?: string;
  imageUrl?: string;
};

export type Order = {
  ID?: string;
  customer_ID: string;
  orderDate: string;
  status?: string;
  totalAmount?: number;
  currency?: string;
  shippingAddress?: string;
  items: Array<{ 
    product_ID: string; 
    quantity: number; 
    unitPrice?: number; 
    totalPrice?: number;
    currency?: string;
  }>;
  totalOrders?: number; 
  averageOrderAmount?: number; 
  monthlyOrdersCount?: number; 
  monthlyRevenue?: number;
  IsActiveEntity?: boolean;
  HasActiveEntity?: boolean;
  HasDraftEntity?: boolean;
};

export type orderId = number;

export type OrderItem = {
  ID?: string;
  order_ID: string;
  product_ID: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
};

export type Customer = {
  ID?: string;
  customerName: string;
  country?: string;
  email: string;
  address?: string;
  phoneNumber: string;
};

export type OrderSummary = {
  month: string | number | Date;
  totalOrders: string;
  totalRevenue: string;
  averageOrderValue: string;
};