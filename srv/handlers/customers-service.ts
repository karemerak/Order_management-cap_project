import { Service, Request } from '@sap/cds';
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
        // Check if user is authenticated
        if (!req.user) {
            req.reject(401, 'Authentication required');
        }

        // Check if user has User role
        if (!req.user.is('User')) {
            req.reject(403, 'Only users with User role can create customers');
        }

        // Check for duplicate email
        const { email } = req.data;
        if (email) {
            console.log('Checking for duplicate customer email:', email);
            const existingCustomer = await srv.read(Customers).where({ email });
            console.log('Existing customer:', existingCustomer);
            if (existingCustomer.length > 0) {
                req.reject(409, `Customer with email ${email} already exists`);
            }
        }

        // Validate required fields
        const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'country'];
        for (const field of requiredFields) {
            if (!req.data[field]) {
                req.reject(400, `${field} is required`);
            }
        }
    });

    // Only admins can update customers
    srv.before('UPDATE', Customers, async (req: Request) => {
        if (!req.user.is('Admin')) {
            req.reject(403, 'Only administrators can update customers');
        }

        // If email is being updated, check for duplicates
        if (req.data.email) {
            console.log('Checking for duplicate customer email during update:', req.data.email);
            const existingCustomer = await srv.read(Customers)
                .where({ email: req.data.email })
                .and({ ID: { not: req.data.ID } });
            console.log('Existing customer during update:', existingCustomer);
            if (existingCustomer.length > 0) {
                req.reject(409, `Customer with email ${req.data.email} already exists`);
            }
        }
    });

    // Only admins can delete customers
    srv.before('DELETE', Customers, async (req: Request) => {
        if (!req.user.is('Admin')) {
            req.reject(403, 'Only administrators can delete customers');
        }
    });
} 