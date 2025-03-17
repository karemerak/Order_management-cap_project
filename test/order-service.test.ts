import cds from '@sap/cds';

describe('Order Management Service', () => {
    const { expect } = cds.test('.').in(__dirname + '/..');
    let srv: any;

    beforeAll(async () => {
        srv = await cds.serve('OrderManagementService').from(__dirname + '/../srv/order-service');
    });

    describe('validateStock', () => {
        it('should return true when product has sufficient stock', async () => {
            const product = await cds.create('Products').entries({
                name: 'Test Product',
                stock: 10,
                price: 100.00
            });

            const validationResult = await srv.run('validateStock', { productId: product.ID, quantity: 5 });
            expect(validationResult).to.be.true;
        });

        it('should return false when product has insufficient stock', async () => {
            const product = await cds.create('Products').entries({
                name: 'Test Product',
                stock: 5,
                price: 100.00
            });

            const validationResult = await srv.run('validateStock', { productId: product.ID, quantity: 10 });
            expect(validationResult).to.be.false;
        });
    });

    describe('calculateOrderTotal', () => {
        it('should correctly calculate order total', async () => {
            const product = await cds.create('Products').entries({
                name: 'Test Product',
                stock: 10,
                price: 100.00
            });

            const customer = await cds.create('Customers').entries({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com'
            });

            const order = await cds.create('Orders').entries({
                customer_ID: customer.ID
            });

            await cds.create('OrderItems').entries([{
                order_ID: order.ID,
                product_ID: product.ID,
                quantity: 2,
                price: product.price,
                totalPrice: product.price * 2
            }]);

            const total = await srv.run('calculateOrderTotal', { orderId: order.ID });
            expect(total).to.equal(200.00);
        });
    });
}); 