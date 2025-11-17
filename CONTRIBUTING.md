# Contributing to Appwrite Finance Backend

First off, thank you for considering contributing to this project! 🎉

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if relevant**
- **Include your environment details** (Node.js version, OS, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Provide specific examples to demonstrate the enhancement**
- **Describe the current behavior and explain the expected behavior**

### Pull Requests

1. **Fork the repository**
2. **Create a new branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Add tests** for your changes
5. **Ensure all tests pass**:
   ```bash
   npm test
   ```
6. **Run the linter**:
   ```bash
   npm run lint:fix
   ```
7. **Commit your changes** with a descriptive message:
   ```bash
   git commit -am 'Add new feature: description'
   ```
8. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
9. **Create a Pull Request**

## Development Setup

1. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/invoiceapp.git
   cd invoiceapp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your Appwrite credentials
   ```

4. **Run tests**:
   ```bash
   npm test
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

## Coding Standards

### JavaScript Style Guide

We follow standard JavaScript conventions:

- Use 2 spaces for indentation
- Use single quotes for strings
- Use semicolons
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

### Code Structure

```javascript
// Good
async function createInvoice(userId, payload) {
  try {
    // Validate input
    if (!payload.items || payload.items.length === 0) {
      throw new Error('Items are required');
    }

    // Business logic
    const subtotal = calculateSubtotal(payload.items);
    const vat = calculateVAT(subtotal);

    // Database operation
    return await database.create({ userId, subtotal, vat });
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
}

// Bad
async function createInvoice(userId, payload) {
  const subtotal = payload.items.reduce((s, i) => s + i.amount, 0);
  return await database.create({ userId, subtotal, vat: subtotal * 0.075 });
}
```

### Commit Messages

Follow the conventional commits specification:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add invoice PDF export functionality
fix: correct VAT calculation for UK invoices
docs: update API documentation with new endpoints
test: add integration tests for payment flow
```

## Testing Guidelines

### Writing Tests

1. **Unit Tests**: Test individual functions in isolation
2. **Integration Tests**: Test API endpoints end-to-end
3. **Mock External Services**: Always mock Appwrite SDK calls

Example:
```javascript
describe('Invoice Service', () => {
  it('should create an invoice with correct VAT', async () => {
    // Arrange
    const userId = 'user123';
    const payload = {
      items: [{ description: 'Test', amount: 100 }],
      country: 'US'
    };

    // Act
    const invoice = await invoiceService.createInvoice(userId, payload);

    // Assert
    expect(invoice.subtotal).toBe(100);
    expect(invoice.vat).toBe(7.5);
    expect(invoice.total).toBe(107.5);
  });
});
```

### Test Coverage

- Aim for at least 80% code coverage
- All new features must include tests
- Fix bugs with tests that reproduce the issue

Run coverage report:
```bash
npm test -- --coverage
```

## Documentation

### Code Documentation

- Add JSDoc comments to all functions
- Document parameters, return values, and exceptions
- Include usage examples for complex functions

Example:
```javascript
/**
 * Create a new invoice with automatic VAT calculation
 * @param {string} userId - The user's ID
 * @param {Object} payload - Invoice data
 * @param {Array<Object>} payload.items - Line items
 * @param {string} [payload.country] - Country code for VAT
 * @returns {Promise<Object>} Created invoice document
 * @throws {Error} If items are empty or invalid
 * @example
 * const invoice = await createInvoice('user123', {
 *   items: [{ description: 'Service', amount: 100 }],
 *   country: 'US'
 * });
 */
async function createInvoice(userId, payload) {
  // Implementation
}
```

### API Documentation

- Update `openapi.yaml` for any API changes
- Add examples for request/response bodies
- Document all error responses

## Project Structure

```
src/
├── app.js                 # Express app setup
├── index.js               # Server entry point
├── controllers/           # Request handlers
├── middleware/            # Custom middleware
├── routes/                # API routes
├── services/              # Business logic
└── utils/                 # Helper functions
```

### Adding New Features

1. **Routes**: Define in `src/routes/`
2. **Controllers**: Add handlers in `src/controllers/`
3. **Services**: Implement business logic in `src/services/`
4. **Tests**: Add tests in `__tests__/`
5. **Documentation**: Update relevant docs

## Common Tasks

### Adding a New Endpoint

1. Define the route in `src/routes/`
2. Create controller handler in `src/controllers/`
3. Implement service logic in `src/services/`
4. Add validation schema with Zod
5. Write tests
6. Update OpenAPI spec

### Adding a New Validation Schema

```javascript
const { z } = require('zod');

const mySchema = z.object({
  field1: z.string().min(1),
  field2: z.number().positive(),
});
```

### Adding a New Service Method

```javascript
async function myNewMethod(userId, data) {
  try {
    // Validate
    if (!data) {
      throw new Error('Data is required');
    }

    // Business logic
    const result = processData(data);

    // Database operation
    return await database.create(result);
  } catch (error) {
    console.error('Error in myNewMethod:', error);
    throw error;
  }
}
```

## Review Process

1. All PRs require at least one approval
2. CI tests must pass
3. Code coverage should not decrease
4. Documentation must be updated

## Getting Help

- **Discord/Slack**: Join our community chat
- **GitHub Issues**: For bug reports and feature requests
- **Email**: Contact maintainers directly
- **Documentation**: Check README and other docs

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- GitHub contributors page

Thank you for contributing! 🙌
