# 1. Objective

The Customer Management Module allows administrators to:

- view all registered customers
- search and filter customers efficiently
- view detailed customer profiles
- track customer activity (orders, services, repairs)
- manage customer status

---

# 2. Feature Location

```text
Admin Dashboard → Management → Customers

Route:

/admin/customers
3. System Overview

Customers are central to the system and are connected with:

Customers → Orders → Quotations → Services → Repairs

This module provides a centralized view of all customer-related activities.

4. UI Layout
----------------------------------------------------------
Customer Management

[ Search Customer... ]   [ Filter ]

----------------------------------------------------------

| Name       | Email        | Phone     | Orders | Status |
|------------|-------------|-----------|--------|--------|
| Dion       | ...         | ...       | 3      | Active |

----------------------------------------------------------

[ View Details ]
5. Core Features
5.1 View Customers

Display the following details in a table:

Name
Email
Phone Number
Total Orders (calculated)
Status (Active / Inactive)
5.2 Search Functionality

Allow searching by:

- Name
- Email
- Phone Number
5.3 Filter Options
All Customers
Active Customers
Inactive Customers
5.4 Customer Details View

When clicking "View Details", display:

Basic Information
Name
Email
Phone
Activity Sections
Order History
On-Site Visit Requests
Repair Requests
6. Customer Details Layout
--------------------------------------------------
Customer Details

Name: Dion Ishera
Email: example@email.com
Phone: 0771234567

-----------------------------------

Orders:
- ORD-1001
- ORD-1002

-----------------------------------

Service Requests:
- On-site visit (Approved)
- Repair request (Pending)

--------------------------------------------------
7. Component Structure
components/admin/customers/

CustomerTable.tsx
CustomerRow.tsx
CustomerSearch.tsx
CustomerFilter.tsx
CustomerDetailsModal.tsx
8. Database Design
Collection
users
Schema
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  role: "customer",
  status: "Active" | "Inactive",
  createdAt: Date
}
9. Derived Data (Important)

The following values are not stored directly, but calculated dynamically:

Total Orders
Total Service Requests
Total Repairs

Example:

orders.count({ userId })
services.count({ userId })
10. API Design
Get All Customers
GET /api/customers
Get Customer Details
GET /api/customers/:id
Search Customers
GET /api/customers?search=value
Update Customer Status
PATCH /api/customers/:id
11. Status System
Active → User can use system normally
Inactive → User is blocked from actions
12. UI Enhancements
Status badges:
Active → Green
Inactive → Gray
Action buttons:
View Details
Disable / Enable Customer
13. Integration with Other Modules
Orders Module
Customer → Orders
Services Module
Customer → On-Site Visits / Repairs
14. Validation Rules
Customer must exist
Role must be "customer"
Status must be valid
15. Development Steps
Phase 1
Create customer list UI
Display basic data
Phase 2
Implement search and filtering
Phase 3
Add customer details modal/page
Phase 4
Connect backend APIs
16. Future Enhancements
Customer activity timeline
Top customers ranking
Revenue per customer
Customer analytics dashboard
Blocking suspicious users
17. Final Outcome

Admin can:

View all customers
Search and filter customers
View detailed profiles
Track customer activity
Manage customer status
18. Summary

This module:

centralizes customer data
connects all system components
improves admin control
enhances system usability and professionalism