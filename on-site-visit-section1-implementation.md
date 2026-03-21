AluMate – On-Site Visit Request (Section 1) Implementation Plan
Project

AluMate – Aluminium Fabrication and Service Management System

This document describes the implementation of the On-Site Visit Request feature (Section 1) for the User Dashboard, excluding the location fetching feature (which will be implemented later in Section 2).

1. Objective

Enable users to:

request an on-site measurement visit

select available date and time slots

enter personal details

submit request

track request status (Request Sent → Approved)

2. Feature Overview

This feature will be available under:

User Dashboard → Services → On-Site Visit

Route:

/dashboard/services/on-site-visit
3. System Flow
User opens On-Site Visit page
        ↓
Select date
        ↓
Select time slot (from available slots)
        ↓
Enter details (name, phone, town)
        ↓
Submit request
        ↓
Status = "Request Sent"
        ↓
(Admin approves later → Status = "Approved")
4. UI Layout
Page Structure
---------------------------------------------------------
On-Site Visit Request

[ Date Selection ]

[ Available Time Slots ]

[ Customer Details Form ]

[ Location Placeholder (Section 2) ]

[ Submit Button ]

---------------------------------------------------------
5. Components Breakdown

Create components under:

components/services/
Components
OnSiteVisitForm.tsx
DateSelector.tsx
TimeSlotSelector.tsx
CustomerDetailsForm.tsx
RequestStatusBadge.tsx
6. Dummy Data (Time Slots)

For now, use static data.

export const availableSlots = [
  {
    date: "2026-03-20",
    slots: ["09:00 AM", "11:00 AM", "02:00 PM"]
  },
  {
    date: "2026-03-21",
    slots: ["10:00 AM", "01:00 PM", "04:00 PM"]
  }
];

Later, this will come from the Admin Dashboard.

7. Date Selection
UI
Select Date

[ Calendar Input ]

Use:

HTML date input OR

date picker library

8. Time Slot Selection
UI
Available Time Slots

[ 09:00 AM ]  [ 11:00 AM ]  [ 02:00 PM ]
Behavior

Only show slots for selected date

Selected slot should be highlighted

Disable unavailable slots (future feature)

9. Customer Details Form
Fields
Full Name
Contact Number
Nearest Town
Example UI
Full Name:        [___________]
Contact Number:  [___________]
Nearest Town:    [___________]
10. Location Placeholder (IMPORTANT)

Since location feature is in Section 2, keep placeholder.

Location (Coming in Section 2)

[ Select Location Button - Disabled ]
11. Request Status System
Status Types
Request Sent
Approved
Rejected (optional later)
UI Badge
[ Request Sent ]  → Yellow
[ Approved ]      → Green
Default Behavior

When user submits:

status = "Request Sent"

Later:

status = "Approved"

(Handled in Admin side)

12. Form Submission
Submit Button
[ Submit Request ]
Data Structure
{
  "userId": "...",
  "date": "2026-03-20",
  "timeSlot": "10:00 AM",
  "fullName": "Dion",
  "contactNumber": "0771234567",
  "nearestTown": "Kalutara",
  "status": "Request Sent",
  "createdAt": "timestamp"
}
13. Database Design

Create collection:

service_requests
Schema Example
{
  userId: String,
  fullName: String,
  contactNumber: String,
  nearestTown: String,
  date: String,
  timeSlot: String,
  status: String,
  createdAt: Date
}
14. Frontend State Management

Use React state:

const [selectedDate, setSelectedDate] = useState("");
const [selectedSlot, setSelectedSlot] = useState("");
const [formData, setFormData] = useState({});
const [status, setStatus] = useState("Request Sent");
15. Validation Rules

Before submission:

Date must be selected
Time slot must be selected
Name required
Phone required
Town required
16. UI Enhancements (Optional)

show success toast:

"Visit request submitted successfully"

disable submit button if incomplete

highlight selected slot

17. Integration with Quotation System

Important:

Service charge is NOT handled here

Instead:

stored in request

later added to quotation by admin

18. Development Steps
Phase 1

Create page UI

Add date picker

Add time slot selector

Phase 2

Add form inputs

Add validation

Phase 3

Add request status

Add dummy submission logic

Phase 4

Store data locally / mock API

19. Future (Section 2 – Not Included Here)

Will include:

Location fetching (GPS / Map)
Google Maps integration
Auto-detect user location
Pin location selection
20. Final Outcome (Section 1)

User can:

Select date
Select time slot
Enter details
Submit request
See status
21. Summary

This section builds the core booking system of the on-site visit feature, while keeping it:

simple

functional

ready for backend integration

extendable with location services