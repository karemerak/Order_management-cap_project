import { Service } from '@sap/cds';
import cds from '@sap/cds';

export default function orderItemsService(srv: Service) {
    const { OrderItems, Products } = srv.entities;

    // Before creating an order item, validate stock and calculate total price
    srv.before('CREATE', OrderItems, async (req: any) => {
        const { product_ID, quantity } = req.data;
        
        // Check if product exists and has enough stock
        const product = await srv.read(Products).where({ ID: product_ID });
        if (!product || product.length === 0) throw new Error(`Product with ID ${product_ID} not found`);
        if (product[0].stock < quantity) throw new Error(`Insufficient stock for product ${product[0].name}`);

        // Calculate total price
        req.data.price = product[0].price;
        req.data.currency = product[0].currency;
        req.data.totalPrice = quantity * product[0].price;
    });

    // After creating an order item, update product stock and order total
    srv.after('CREATE', OrderItems, async (data: any) => {
        // Update product stock
        const product = await srv.read(Products).where({ ID: data.product_ID });
        if (product && product.length > 0) {
            await srv.update(Products).where({ ID: data.product_ID }).set({ 
                stock: product[0].stock - data.quantity 
            });
        }

        // Update order total using the shared function
        if ((srv as any).calculateOrderTotal) {
            await (srv as any).calculateOrderTotal(data.order_ID);
        }
    });
} 