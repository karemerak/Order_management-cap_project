import { Service } from '@sap/cds';

export default function customersService(this: Service) {
    const { Customers } = this.entities;

    // Add any customer-specific handlers here
    // For example, validation before creating a customer
    this.before('CREATE', Customers, async (req: any) => {
        const { email } = req.data;
        
        // Check if email already exists
        const existingCustomer = await SELECT.one.from(Customers).where({ email });
        if (existingCustomer) {
            throw new Error(`Customer with email ${email} already exists`);
        }
    });
} 