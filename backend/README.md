# AluMate Backend

NestJS backend for the AluMate - Web based Aluminium Fabrication and Service Management System.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** MongoDB Atlas (via Mongoose)
- **Auth:** JWT + Passport (to be implemented)
- **Real-time:** Socket.io (to be implemented)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Build for production
npm run build
npm run start:prod
```

## Project Structure

```
src/
├── main.ts                         # App bootstrap, CORS, validation
├── app.module.ts                   # Root module
├── common/                         # Shared decorators, guards, pipes
│   ├── decorators/roles.decorator.ts
│   └── guards/roles.guard.ts
├── users/                          # Users module
│   ├── schemas/user.schema.ts
│   ├── users.module.ts
│   └── users.service.ts
├── orders/                         # Orders module
│   ├── schemas/order.schema.ts
│   ├── orders.module.ts
│   └── orders.service.ts
├── quotations/                     # Quotations module
│   ├── schemas/quotation.schema.ts
│   ├── quotations.module.ts
│   └── quotations.service.ts
├── services/                       # Service requests module
│   ├── schemas/service-request.schema.ts
│   ├── services.module.ts
│   └── services.service.ts
├── inventory/                      # Inventory module
│   ├── schemas/inventory-item.schema.ts
│   ├── inventory.module.ts
│   └── inventory.service.ts
└── notifications/                  # Notifications module
    ├── schemas/notification.schema.ts
    ├── notifications.module.ts
    └── notifications.service.ts
```

## Environment Variables

Create a `.env` file in the backend root:

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_EXPIRATION=7d
PORT=3001
FRONTEND_URL=http://localhost:3000
```
