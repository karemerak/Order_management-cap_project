import cds from '@sap/cds';

const test = cds.test('.').in(__dirname + '/..');

beforeAll(async () => {
    // Initialize test database
    await test;
});

afterAll(async () => {
    // Clean up database tables
    const db = await cds.connect.to('sqlite:test.db');
    await db.run('DROP TABLE IF EXISTS OrderItems');
    await db.run('DROP TABLE IF EXISTS Orders');
    await db.run('DROP TABLE IF EXISTS Products');
    await db.run('DROP TABLE IF EXISTS Customers');
});

beforeEach(async () => {
    // Clean up database before each test
    const db = await cds.connect.to('sqlite:test.db');
    await db.run('DELETE FROM OrderItems');
    await db.run('DELETE FROM Orders');
    await db.run('DELETE FROM Products');
    await db.run('DELETE FROM Customers');
}); 