import { Service, Request } from '@sap/cds';
import { Product } from '../custom-types';

/**
 * Products Service Handler
 * @module productsService
 * @param {Service} srv - The CDS service instance
 */
export default function productsService(srv: Service) {
    const { Products } = srv.entities;

    // Only admins can create products
    srv.before('CREATE', Products, async (req: Request) => {
        // Check if user is authenticated
        if (!req.user) {
            req.reject(401, 'Authentication required');
        }

        // Check if user has admin role
        if (!req.user.is('Admin')) {
            req.reject(403, 'Only administrators can create products');
        }

        // Check for duplicate name
        const { name } = req.data;
        if (name) {
            console.log('Checking for duplicate product name:', name);
            const existingProduct = await srv.read(Products).where({ name });
            console.log('Existing product:', existingProduct);
            if (existingProduct.length > 0) {
                req.reject(409, `Product with name ${name} already exists`);
            }
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

    // Only admins can update products
    srv.before('UPDATE', Products, async (req: Request) => {
        if (!req.user.is('Admin')) {
            req.reject(403, 'Only administrators can update products');
        }

        // If name is being updated, check for duplicates
        if (req.data.name) {
            console.log('Checking for duplicate product name during update:', req.data.name);
            const existingProduct = await srv.read(Products)
                .where({ name: req.data.name })
                .and({ ID: { not: req.data.ID } });
            if (existingProduct.length > 0) {
                req.reject(409, `Product with name ${req.data.name} already exists`);
            }
        }

        // Convert string values to numbers if they exist
        if (req.data.price && typeof req.data.price === 'string') {
            req.data.price = parseFloat(req.data.price);
        }
        if (req.data.stock && typeof req.data.stock === 'string') {
            req.data.stock = parseInt(req.data.stock);
        }

        // Ensure status is valid if it's being updated
        if (req.data.status && !['available', 'outOfStock', 'discontinued'].includes(req.data.status)) {
            req.reject(400, 'Invalid status value');
        }
    });

    // Only admins can delete products
    srv.before('DELETE', Products, async (req: Request) => {
        if (!req.user.is('Admin')) {
            req.reject(403, 'Only administrators can delete products');
        }
    });
} 