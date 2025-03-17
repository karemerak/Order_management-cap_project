import cds from '@sap/cds';

describe('Order Management Service', () => {
    const { expect } = cds.test('.').in(__dirname + '/..');
    let srv: any;

    beforeAll(async () => {
        srv = await cds.serve('OrderManagementService').from(__dirname + '/../srv/order-service');
        expect(srv).toBeDefined();
    });

    describe('validateStock', () => {
        it('should return true when product has sufficient stock', async () => {
            // Create test product
            const product = await cds.create('Products').entries({
                name: 'Test Product',
                stock: 10,
                price: 100.00
            });

            const result = await srv.run(SELECT.one.from('Products').where({ ID: product.ID }));
            expect(result).toBeDefined();

            const validationResult = await srv.run({
                query: 'validateStock',
                data: { productId: product.ID, quantity: 5 }
            });

            expect(validationResult).toBe(true);
        });

        it('should return false when product has insufficient stock', async () => {
            // Create test product
            const product = await cds.create('Products').entries({
                name: 'Test Product',
                stock: 5,
                price: 100.00
            });

            const validationResult = await srv.run({
                query: 'validateStock',
                data: { productId: product.ID, quantity: 10 }
            });

            expect(validationResult).toBe(false);
        });
    });

    describe('calculateOrderTotal', () => {
        it('should correctly calculate order total', async () => {
            // Create test product
            const product = await cds.create('Products').entries({
                name: 'Test Product',
                stock: 10,
                price: 100.00
            });

            // Create test customer
            const customer = await cds.create('Customers').entries({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com'
            });

            // Create test order
            const order = await cds.create('Orders').entries({
                customer_ID: customer.ID
            });

            // Create order items
            await cds.create('OrderItems').entries([{
                order_ID: order.ID,
                product_ID: product.ID,
                quantity: 2,
                price: product.price,
                totalPrice: product.price * 2
            }]);

            const total = await srv.run({
                query: 'calculateOrderTotal',
                data: { orderId: order.ID }
            });

            expect(total).toBe(200.00);
        });
    });
}); 