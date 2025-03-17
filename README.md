# Order Management System

A cloud-based Order Management System built with SAP CAP, featuring product, customer, and order management capabilities.

## Project Structure

```
├── db/
│   └── schema.cds         # Data model definitions
├── srv/
│   ├── order-service.cds  # Service definitions
│   └── order-service.ts   # Service implementation
├── test/
│   └── order-service.test.ts  # Unit tests
├── package.json
└── tsconfig.json
```

## Prerequisites

- Node.js 14 or higher
- SAP Cloud Application Programming Model (CAP)
- TypeScript

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the TypeScript files:
   ```bash
   npm run build
   ```

3. Start the CAP server:
   ```bash
   npm start
   ```

## Features

- Product Management (CRUD operations)
- Customer Management
- Order Processing with stock validation
- Automatic order total calculation
- Unit tests for business logic

## Testing

Run the test suite:
```bash
npm test
```

## API Endpoints

The service is exposed at: `/odata/v4/order-management`

### Entities
- Products
- Customers
- Orders
- OrderItems

### Custom Actions
- validateStock
- calculateOrderTotal

## Development

1. Make changes to the CDS models in `db/schema.cds`
2. Update service definitions in `srv/order-service.cds`
3. Implement business logic in `srv/order-service.ts`
4. Add tests in `test/order-service.test.ts`
5. Build and run the application 