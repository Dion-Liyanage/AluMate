This document defines the **complete Service Module**, including:

- On-Site Visit Requests
- Repair Requests
- Service Availability Management (Admin)

This module ensures a **full lifecycle service system**.

---

# 1. System Overview

The service module is divided into two main parts:

```text
1. Service Requests (User + Admin)
2. Service Availability (Admin only)
2. System Architecture
User
 ↓
Create Service Request
 ↓
Admin manages requests
 ↓
Admin controls availability
 ↓
User sees available slots
3. Service Types
On-Site Visit
Repair Request

Each request contains:

{
  "serviceType": "on-site-visit" | "repair"
}
4. USER SIDE IMPLEMENTATION
4.1 On-Site Visit Page

Route:

/dashboard/services/on-site-visit
Features
Select Date
Select Time Slot (from admin)
Enter Contact Details
Select Location
Submit Request
Data Structure
{
  "userId": "U001",
  "serviceType": "on-site-visit",
  "date": "2026-03-20",
  "timeSlot": "10:00 AM",
  "fullName": "Dion",
  "contactNumber": "0771234567",
  "nearestTown": "Kalutara",
  "location": {
    "lat": 6.9271,
    "lng": 79.8612
  },
  "status": "Request Sent"
}
Time Slot Fetching
GET /api/availability?date=YYYY-MM-DD
UI Behavior
If slots exist → show buttons
If empty → "No slots available"
4.2 Repair Request Page

Route:

/dashboard/services/repairs
Features
Select Order Number
Auto-load Order Details
Enter Issue Description
Upload Image (optional)
Submit Request
Data Structure
{
  "userId": "U001",
  "serviceType": "repair",
  "orderId": "ORD-1001",
  "issueDescription": "Sliding door stuck",
  "imageUrl": "optional",
  "status": "Request Sent"
}
5. ADMIN SIDE IMPLEMENTATION
5.1 Services Module Structure
Admin → Services
        ├── Requests
        └── Availability
5.2 Service Requests Page (Existing)

Route:

/admin/services
Features
View all requests
Filter by:
All
On-Site Visits
Repairs
Update status
View details
Table Columns
ID | Service Type | Customer | Date | Status | Actions
Status Types
Request Sent
Approved
In Progress
Completed
Cancelled
5.3 Service Availability Page (NEW)

Route:

/admin/services/availability
Purpose

Controls:

Available Dates
Available Time Slots
UI Layout
--------------------------------------------------------
Service Availability

[ Select Date ]

[ Add Time Slot ]

[ Save Availability ]

--------------------------------------------------------

Available Slots:

[ 09:00 AM ] [ 11:00 AM ] [ 02:00 PM ]
        ❌ Remove
--------------------------------------------------------
Features
Add date
Add time slots
Remove slots
Save availability
View existing slots
6. DATABASE DESIGN
6.1 Service Requests

Collection:

service_requests
Schema
{
  userId: String,
  serviceType: String, // "on-site-visit" | "repair"
  orderId: String,
  date: String,
  timeSlot: String,
  fullName: String,
  contactNumber: String,
  nearestTown: String,
  location: {
    lat: Number,
    lng: Number
  },
  issueDescription: String,
  imageUrl: String,
  status: String,
  createdAt: Date
}
6.2 Service Availability

Collection:

service_availability
Schema
{
  date: String,
  slots: [String],
  createdAt: Date,
  updatedAt: Date
}
7. API DESIGN
Availability APIs
Get Slots
GET /api/availability?date=2026-03-20
Save Slots
POST /api/availability

Body:

{
  "date": "2026-03-20",
  "slots": ["09:00 AM", "11:00 AM"]
}
Service Request APIs
Create Request
POST /api/services
Get Requests
GET /api/services
Update Status
PATCH /api/services/:id
8. SYSTEM FLOW
On-Site Visit
Admin sets availability
        ↓
User selects date
        ↓
Fetch available slots
        ↓
User selects slot
        ↓
Submit request
        ↓
Admin manages request
Repair Request
User selects order
        ↓
Submit issue
        ↓
Admin reviews
        ↓
Update status
9. VALIDATION RULES
On-Site Visit
Date required
Time slot required
Contact details required
Location required
Repair
Order required
Issue description required
10. UI ENHANCEMENTS
Disable booked slots
Highlight selected slot
Show status badges
Search & filter requests
11. FUTURE ENHANCEMENTS
Technician assignment
Route optimization
Notifications
Calendar view
Auto scheduling
Service cost integration
12. FINAL OUTCOME

User can:

Book on-site visits
Request repairs
Track service status

Admin can:

Manage requests
Control availability
Update statuses
Handle service workflow
13. SUMMARY

This implementation:

separates request handling and scheduling
supports multiple service types
ensures scalability
completes the product lifecycle system

---

If you want next, I can:

✅ generate **actual React UI for Availability page (same style as your admin UI)**  
✅ connect this with your **MongoDB / ASP.NET backend**  
✅ or build **API endpoints step-by-step**