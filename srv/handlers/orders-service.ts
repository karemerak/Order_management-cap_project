import { Service, Request } from '@sap/cds';
import cds from '@sap/cds';
import { Order, OrderItem } from '../custom-types';

/**
 * Orders Service Handler
 * @module ordersService
 * @param {Service} srv - The CDS service instance
 */
export default function ordersService(srv: Service) {
    const { Orders, OrderItems, Products } = srv.entities;

    // Before CREATE handler for Orders
    srv.before('CREATE', Orders, async (req: Request) => {
        console.log('=== Order Creation Started ===');
        console.log('User:', req.user?.id);
        console.log('User roles:', req.user?.roles);

        if (!req.user.is('User')) {
            console.log('User does not have User role. Available roles:', req.user.roles);
            req.reject(403, 'Only users with User role can create orders');
        }

        const order = req.data as Order;
        if (!order.customer_ID) return req.error(400, 'Customer ID is required');

        if (order.items?.length) {
            const tx = cds.transaction(req);
            let orderTotal = 0;

            for (const item of order.items) {
                if (!item.product_ID) return req.error(400, 'Product ID is required for each item');

                const product = await tx
                    .read(Products)
                    .columns(["price", "stock", "currency"])
                    .where({ ID: item.product_ID });

                if (!product?.[0]) {
                    return req.error(404, `Product with ID ${item.product_ID} not found`);
                }

                if (product[0].stock < item.quantity) {
                    return req.error(400, `Insufficient stock for product ${item.product_ID}`);
                }

                item.unitPrice = product[0].price;
                item.totalPrice = item.quantity * parseFloat(product[0].price);
                orderTotal += item.totalPrice;

                await tx
                    .update(Products)
                    .set({ stock: product[0].stock - item.quantity })
                    .where({ ID: item.product_ID });
            }

            order.totalAmount = orderTotal;
            order.currency = order.items[0].currency;
        }

        // Set draft-related fields
        order.IsActiveEntity = true;
        order.HasActiveEntity = false;
        order.HasDraftEntity = false;
    });

    // Submit order action
    srv.on("submitOrder", async (req: Request) => {
        if (!req.user.is('User')) {
            req.reject(403, 'Only users with User role can submit orders');
        }
        const { orderId } = req.data;
        const tx = cds.transaction(req);

        const order = await tx.read(Orders).where({ ID: orderId });
        if (!order?.[0]) return req.error(404, `Order with ID ${orderId} not found`);

        await tx
            .update(Orders)
            .set({
                status: "PROCESSING",
                modifiedAt: new Date(),
            })
            .where({ ID: orderId });

        return true;
    });

    // Cancel order action
    srv.on("cancelOrder", "Orders", async (req: Request) => {
        if (!req.user.is('User')) {
            req.reject(403, 'Only users with User role can cancel orders');
        }
        const { orderId } = req.data;
        const tx = cds.transaction(req);

        const order = await tx.read(Orders).where({ ID: orderId });
        if (!order?.[0]) return req.error(404, `Order with ID ${orderId} not found`);

        // Restore product stock
        for (const item of order[0].items) {
            const product = await tx.read(Products).where({ ID: item.product_ID });
            if (product?.[0]) {
                await tx
                    .update(Products)
                    .set({ stock: product[0].stock + item.quantity })
                    .where({ ID: item.product_ID });
            }
        }

        await tx
            .update(Orders)
            .set({ status: "CANCELLED" })
            .where({ ID: orderId });

        return true;
    });

    // After READ handler for Orders to calculate virtual fields
    srv.after("READ", "Orders", async (orders: Order[], req: Request) => {
        if (!Array.isArray(orders)) {
            orders = [orders];
        }

        const tx = cds.transaction(req);

        // Calculate analytics for each order
        for (const order of orders) {
            try {
                // Total orders count
                const totalOrdersResult = await tx
                    .read("orderms.Orders")
                    .columns("COUNT(*) as count");
                order.totalOrders = totalOrdersResult[0]?.count || 0;

                // Average order amount
                const avgResult = await tx
                    .read("orderms.Orders")
                    .columns("AVG(totalAmount) as avg");
                order.averageOrderAmount = avgResult[0]?.avg || 0;

                // Monthly statistics
                const today = new Date();
                const firstDayOfMonth = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    1
                );

                // Monthly orders count
                const monthlyOrdersResult = await tx
                    .read("orderms.Orders")
                    .columns("COUNT(*) as count")
                    .where({ orderDate: { ">=": firstDayOfMonth } });
                order.monthlyOrdersCount = monthlyOrdersResult[0]?.count || 0;

                // Monthly revenue
                const monthlyRevResult = await tx
                    .read("orderms.Orders")
                    .columns("SUM(totalAmount) as sum")
                    .where({ orderDate: { ">=": firstDayOfMonth } });
                order.monthlyRevenue = monthlyRevResult[0]?.sum || 0;
            } catch (error) {
                req.warn(`Failed to calculate analytics for order ${order.ID}`);
            }
        }
    });

    // READ handler for OrderKPIs entity
    srv.on("READ", "OrderKPIs", async (req: Request) => {
        try {
            const tx = cds.transaction(req);

            // Group orders by month and calculate aggregates
            const analytics = await tx
                .read("orderms.Orders")
                .columns("orderDate as month")
                .columns("COUNT(*) as totalOrders")
                .columns("SUM(totalAmount) as totalRevenue")
                .columns("AVG(totalAmount) as averageOrderValue")
                .columns("status")
                .groupBy("orderDate")
                .groupBy("status");

            // Format the results
            return analytics.map((item: any) => ({
                ...item,
                ID: cds.utils.uuid(),
                month: new Date(item.month),
                totalOrders: parseInt(item.totalOrders),
                totalRevenue: parseFloat(item.totalRevenue),
                averageOrderValue: parseFloat(item.averageOrderValue)
            }));
        } catch (error) {
            req.error(500, 'Failed to retrieve analytics');
        }
    });
} 