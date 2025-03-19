import { Service } from '@sap/cds';

export default function ordersService(srv: Service) {
    const { Orders, Products, OrderItems } = srv.entities;

    // Add order-specific handlers here
    srv.on('calculateOrderTotal', async (req: any) => {
        const orderId = req.data.orderId;
        return calculateOrderTotal.call(srv, orderId);
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
    (srv as any).calculateOrderTotal = calculateOrderTotal;
} 