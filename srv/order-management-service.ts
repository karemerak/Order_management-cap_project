import cds from '@sap/cds';
import { Service } from '@sap/cds';
import productsService from './handlers/products-service';
import ordersService from './handlers/orders-service';
import orderItemsService from './handlers/order-items-service';
import customersService from './handlers/customers-service';

/**
 * Order Management Service
 * @module orderManagementService
 */
module.exports = cds.service.impl(async function (this: Service) {
  const { Products, Orders, OrderItems, Customers } = this.entities as any;

  // Import and use the handlers from the handlers folder
  productsService.call(this);
  ordersService.call(this);
  orderItemsService.call(this);
  customersService.call(this);
}); 