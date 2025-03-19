namespace orderms;

using { Currency, managed, cuid } from '@sap/cds/common';

entity Products : cuid, managed {
  name        : String(100) @title: 'Product Name';
  description : String(1000);
  price       : Decimal(9,2);
  currency    : Currency;
  stock       : Integer;
  category    : String(100);
  supplier    : String(100);
  status      : String(20) enum {
    available;
    outOfStock;
    discontinued;
  };
  orderItems  : Association to many OrderItems on orderItems.product = $self;
}

entity Customers : cuid, managed {
  firstName   : String(50);
  lastName    : String(50);
  email       : String(100) @unique;
  phone       : String(20);
  address     : String(200);
  city        : String(100);
  country     : String(100);
  orders      : Association to many Orders on orders.customer = $self;
}

// Entity for an Order
@odata.draft.enabled
@odata.draft.bypass
entity Orders : cuid, managed {
    customer     : Association to Customers;
    orderDate    : Date default $now;
    status       : String(20) enum {
        NEW;
        PROCESSING;
        SHIPPED;
        DELIVERED;
        CANCELLED;
    } default 'NEW';
    totalAmount  : Decimal(15, 2);
    currency     : String(3);
    shippingAddress : String(1000);
    items        : Composition of many OrderItems on items.order = $self;
    
    @Core.Computed : true
    totalOrders : Integer;
    @Core.Computed : true
    averageOrderAmount : Decimal(15,2);
    @Core.Computed : true
    monthlyOrdersCount : Integer;
    @Core.Computed : true
    monthlyRevenue : Decimal(15,2);
}

entity OrderItems : cuid {
  order       : Association to Orders;
  product     : Association to Products;
  quantity    : Integer;
  price       : Decimal(9,2);
  currency    : Currency;
  totalPrice  : Decimal(9,2);
} 