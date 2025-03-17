import { Service } from '@sap/cds';

export default function ordersService(this: Service) {
    const { Orders, OrderItems } = this.entities;

    // Add order-specific handlers here
    this.on('calculateOrderTotal', async (req: any) => {
        const orderId = req.data.orderId;
        return calculateOrderTotal.call(this, orderId);
    });

    // Helper function to calculate order total
    async function calculateOrderTotal(orderId: string): Promise<number> {
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

    // Make calculateOrderTotal available to other services
    (this as any).calculateOrderTotal = calculateOrderTotal;
} 