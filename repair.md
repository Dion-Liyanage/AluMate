# AluMate – Repair Service Section (User Dashboard) Implementation Plan

## Project
AluMate – Aluminium Fabrication and Service Management System

This document defines the implementation of the **Repair Service Feature**, allowing users to request maintenance or repair services for previously completed orders.

---

# 1. Objective

Enable users to:

- request repairs for previously ordered products
- identify products using **Order Number**
- describe issues clearly
- optionally upload images
- track repair request status

---

# 2. Key Concept

Each product is linked to a **unique Order Number**.

```text
Order Number → Product → Repair Request

This ensures:

accurate identification
no duplicate/confusion
direct connection to past orders
3. Feature Location
User Dashboard → Services → Repairs

Route:

/dashboard/services/repairs
4. System Flow
User opens Repair Page
        ↓
Select Order Number
        ↓
View Order Details (auto-filled)
        ↓
Enter Issue Description
        ↓
Upload Image (optional)
        ↓
Submit Repair Request
        ↓
Status = "Request Sent"
        ↓
Admin reviews → updates status
5. UI Layout
---------------------------------------------------------
Repair Service Request

[ Select Order Number ]

[ Order Details Preview ]

[ Issue Description ]

[ Upload Image ]

[ Submit Request ]

[ Status Display ]

---------------------------------------------------------
6. Components Structure
components/services/repairs/

RepairForm.tsx
OrderSelector.tsx
OrderPreviewCard.tsx
IssueInput.tsx
ImageUpload.tsx
RepairStatusBadge.tsx
7. Order Selection
Data Source

Fetch from:

User's Completed Orders
UI
Select Order Number

[ ORD-1001 ▼ ]
Behavior
Dropdown lists only completed orders
On selection → load order details
8. Order Preview (Auto-Fill)

Display selected order details:

Order ID: ORD-1001
Product Type: Sliding Window
Design Type: Custom
Date: 2026-02-10
9. Issue Description
Describe the issue

[ Textarea input ]

Example:
"Sliding door is stuck and not moving smoothly"
10. Image Upload (Optional)
Upload Image

[ Choose File ]

Purpose:

helps admin understand issue
improves service accuracy
11. Repair Status System
Status Types
Request Sent
Under Review
Approved
In Progress
Completed
Rejected (optional)
UI Badge Example
[ Request Sent ] → Yellow
[ Approved ] → Green
[ In Progress ] → Blue
[ Completed ] → Gray
12. Data Structure
{
  "userId": "USER001",
  "orderId": "ORD-1001",
  "issueDescription": "Sliding door stuck",
  "imageUrl": "optional",
  "status": "Request Sent",
  "createdAt": "timestamp"
}
13. Database Collection
repair_requests
Schema Example
{
  userId: String,
  orderId: String,
  issueDescription: String,
  imageUrl: String,
  status: String,
  createdAt: Date
}
14. Validation Rules

Before submission:

Order must be selected
Issue description required

Optional:

Image upload
15. Submission Logic

On submit:

status = "Request Sent"
16. Integration with Admin (Future)

Admin will:

View repair requests
Update status
Assign technician
Schedule visit
Add repair cost (if needed)
17. UI Enhancements

Optional:

show recent repair requests
allow filtering by status
display timeline of repair progress
18. Development Steps
Phase 1
Create repair page UI
Add order dropdown
Phase 2
Display order details
Add issue input
Phase 3
Add image upload
Add submit logic
Phase 4
Add status display
Store data (mock or backend)
19. Future Enhancements
Admin repair dashboard
Technician assignment
Repair cost estimation
Notification system
20. Final Outcome

User can:

Select past order
Report issue
Upload image
Submit request
Track status
21. Summary

This feature:

completes the product lifecycle
improves system realism
enhances user experience
strengthens final year project quality