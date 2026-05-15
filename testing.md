# AluMate Backend Testing Summary

This document provides an overview of the testing suite implemented for the AluMate backend. We use **Jest** for unit testing and **Supertest** for E2E integration testing.

## 📊 Test Coverage Summary

| Module | Test Type | File Path | Description |
| :--- | :--- | :--- | :--- |
| **Authentication** | Unit | `src/auth/auth.service.spec.ts` | Validates login, registration, and password hashing logic. |
| **Authentication** | E2E | `test/auth.e2e-spec.ts` | Verifies `/api/v1/auth` endpoints and validation pipes. |
| **Orders** | Unit | `src/orders/orders.service.spec.ts` | Tests order ID generation and confirmation email triggers. |
| **Orders** | E2E | `test/orders.e2e-spec.ts` | Checks security and route protection for order management. |
| **Quotations** | Unit | `src/quotations/quotations.service.spec.ts` | Validates quotation creation and customer retrieval logic. |
| **Quotations** | E2E | `test/quotations.e2e-spec.ts` | Ensures quotation endpoints require valid authentication. |
| **Security (RBAC)** | E2E | `test/rbac.e2e-spec.ts` | Verifies that Customers are blocked from Admin Analytics routes. |
| **Cloudinary** | Unit | `src/common/cloudinary/cloudinary.service.spec.ts` | Tests file upload streams and error handling for media. |

---

## 🛠️ How to Run Tests

Ensure you are in the `backend` directory before running these commands.

### 1. Run All Unit Tests
Fast execution with mocked dependencies.
```bash
npm run test
```

### 2. Run All E2E Integration Tests
Full request/response cycle testing (requires MongoDB connection).
```bash
npm run test:e2e
```

### 3. Run a Specific Test File
If you want to run only one specific test (e.g., RBAC):
```bash
npx jest test/rbac.e2e-spec.ts
```

---

## 🖥️ Frontend Verification

While the backend uses automated Jest suites, the frontend is verified through its robust build process and manual UI testing.

### Build Verification
Running the build command ensures that all TypeScript types are correct and that there are no broken imports or invalid components across the entire application.
```bash
# Navigate to frontend directory
npm run build
```

### Running Locally
To test the frontend features in real-time:
```bash
# Development mode (Hot reloading)
npm run dev

# Production mode (Test final build)
npm run start
```
*   **Mocking**: We mock the `MailService` and `CloudinaryService` to prevent sending real emails or uploading files during tests.
*   **Database Isolation**: Tests use the real `AppModule` configuration but can be easily pointed to a `.env.test` for a separate database if needed.
*   **JWT Simulation**: The E2E tests generate real JWT tokens with different roles (`admin`, `customer`) to verify security logic without needing a manual login step.
