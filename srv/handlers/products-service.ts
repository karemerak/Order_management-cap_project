import { Service, Request } from '@sap/cds';
import { Product } from '../custom-types';

/**
 * Products Service Handler
 * @module productsService
 * @param {Service} srv - The CDS service instance
 */
export default (srv: Service) => {
    const { Products } = srv.entities as any;

   /**
   * Before CREATE handler for Products
   * @param {Request} req - The request object
   * @returns {Promise<void>}
   */
    srv.before("CREATE", 'Products', async (req: Request) => {
        // Check if user has admin role
        if (!req.user.is('Admin')) {
            req.reject(403, 'Only administrators can create new products');
        }

        // Convert string values to numbers
        if (typeof req.data.price === 'string') {
            req.data.price = parseFloat(req.data.price);
        }
        if (typeof req.data.stock === 'string') {
            req.data.stock = parseInt(req.data.stock);
        }

        // Ensure status is valid
        if (req.data.status && !['available', 'outOfStock', 'discontinued'].includes(req.data.status)) {
            req.reject(400, 'Invalid status value');
        }
    });

    // Add checks for UPDATE and DELETE as well
    srv.before("UPDATE", 'Products', async (req: Request) => {
        if (!req.user.is('Admin')) {
            req.reject(403, 'Only administrators can update products');
        }
    });

    srv.before("DELETE", 'Products', async (req: Request) => {
        if (!req.user.is('Admin')) {
            req.reject(403, 'Only administrators can delete products');
        }
    });
} 