import { Service } from '@sap/cds';

export default function orderItemsService(srv: Service) {
    const { OrderItems, Products } = srv.entities;

    // Before creating an order item, validate stock and calculate total price
    srv.before('CREATE', OrderItems, async (req: any) => {
        const { product_ID, quantity } = req.data;
        
        // Check if product exists and has enough stock
        const product = await SELECT.one.from(Products).where({ ID: product_ID });
        if (!product) throw new Error(`Product with ID ${product_ID} not found`);
        if (product.stock < quantity) throw new Error(`Insufficient stock for product ${product.name}`);

        // Calculate total price
        req.data.price = product.price;
        req.data.currency = product.currency;
        req.data.totalPrice = quantity * product.price;
    });

    // After creating an order item, update product stock and order total
    srv.after('CREATE', OrderItems, async (data: any) => {
        // Update product stock
        const product = await SELECT.one.from(Products).where({ ID: data.product_ID });
        await UPDATE(Products)
            .set({ stock: product.stock - data.quantity })
            .where({ ID: data.product_ID });

        // Update order total using the shared function
        if ((srv as any).calculateOrderTotal) {
            await (srv as any).calculateOrderTotal(data.order_ID);
        }
    });
} 