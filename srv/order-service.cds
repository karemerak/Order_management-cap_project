using { com.orderms as db } from '../db/schema';

service OrderManagementService @(path: '/odata/v4/order-management') {
    entity Products as projection on db.Products;
    entity Customers as projection on db.Customers;
    entity Orders as projection on db.Orders;
    entity OrderItems as projection on db.OrderItems;

    // Custom actions
    action validateStock(productId: UUID, quantity: Integer) returns Boolean;
    action calculateOrderTotal(orderId: UUID) returns Decimal(9,2);
} 