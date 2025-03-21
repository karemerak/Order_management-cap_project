import { Service, Request, SELECT } from '@sap/cds';
import { Customer } from '../custom-types';

/**
 * Customers Service Handler
 * @module customersService
 * @param {Service} srv - The CDS service instance
 */
export default function customersService(srv: Service) {
    const { Customers } = srv.entities;

    // Only authenticated users can create customers
    srv.before('CREATE', Customers, async (req: Request) => {
        if (!req.user) {
            req.reject(401, 'Authentication required');
        }

        const { email } = req.data;
        const existingCustomer = await SELECT.one.from(Customers).where({ email });
        if (existingCustomer) {
            req.reject(409, `Customer with email ${email} already exists`);
        }
    });

    // Only admins can update customers
    srv.before('UPDATE', Customers, async (req: Request) => {
        if (!req.user.is('Admin')) {
            req.reject(403, 'Only administrators can update customers');
        }
    });

    // Only admins can delete customers
    srv.before('DELETE', Customers, async (req: Request) => {
        if (!req.user.is('Admin')) {
            req.reject(403, 'Only administrators can delete customers');
        }
    });
} 