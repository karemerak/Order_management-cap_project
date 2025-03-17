import { Service } from '@sap/cds';

export default function productsService(this: Service) {
    const { Products } = this.entities;

    // Add any product-specific handlers here
    this.on('validateStock', async (req: any) => {
        const { productId, quantity } = req.data;
        const product = await SELECT.one.from(Products).where({ ID: productId });
        return product && product.stock >= quantity;
    });
} 