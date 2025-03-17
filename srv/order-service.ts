import { Service } from '@sap/cds';

export class OrderManagementService extends Service {
    async init() {
        const { Products, Orders, OrderItems } = this.entities;

        // Before creating an order item, validate stock and calculate total price
        this.before('CREATE', OrderItems, async (req: any) => {
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
        this.after('CREATE', OrderItems, async (data: any) => {
            // Update product stock
            const product = await SELECT.one.from(Products).where({ ID: data.product_ID });
            await UPDATE(Products)
                .set({ stock: product.stock - data.quantity })
                .where({ ID: data.product_ID });

            // Update order total
            await this.calculateOrderTotal(data.order_ID);
        });

        // Implement custom actions
        this.on('validateStock', async (req: any) => {
            const { productId, quantity } = req.data;
            const product = await SELECT.one.from(Products).where({ ID: productId });
            return product && product.stock >= quantity;
        });

        this.on('calculateOrderTotal', async (req: any) => {
            const orderId = req.data.orderId;
            return this.calculateOrderTotal(orderId);
        });

        await super.init();
    }

    private async calculateOrderTotal(orderId: string): Promise<number> {
        const { Orders, OrderItems } = this.entities;
        
        // Get all items for the order
        const items = await SELECT.from(OrderItems).where({ order_ID: orderId });
        
        // Calculate total
        const total = items.reduce((sum: number, item: any) => sum + item.totalPrice, 0);
        
        // Update order
        await UPDATE(Orders)
            .set({ totalAmount: total })
            .where({ ID: orderId });
            
        return total;
    }
} 