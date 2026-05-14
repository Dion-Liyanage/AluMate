AluMate – Semi-Automated Intelligent Quotation Generation System
Revised Quotation Workflow & Measurement Handling Plan
Project

AluMate – Aluminium Fabrication and Service Management System

This document defines the revised quotation generation architecture for the AluMate platform.

The new approach replaces a fully automated quotation workflow with a:

“Semi-Automated Intelligent Quotation Generation System”

This model is:

more realistic
industry-aligned
user-friendly
technically practical
academically stronger

for residential aluminium fabrication services.

1. WHY THE SYSTEM WAS REVISED

Initially, the system attempted to:

automatically calculate all material dimensions
automatically determine every profile size
automatically estimate every internal component

However, this approach became unrealistic because residential customers typically do NOT know:

internal frame dimensions
glass panel measurements
aluminium profile specifications
reinforcement requirements
locking system dimensions
structural calculations

Therefore, requiring detailed technical measurements from customers would:

confuse users
increase incorrect inputs
reduce usability
create inaccurate quotations
2. NEW SYSTEM APPROACH

The revised system uses:

Semi-Automated Quotation Generation

Meaning:

Responsibility	Handled By
Basic measurements	User
Design selection	User
Usage preferences	User
Initial material recommendations	System
Technical validation	Admin
Final material selection	Admin
Final quotation generation	Admin
3. CORE CONCEPT

The system intelligently assists the quotation process while allowing administrators to review and finalize technical fabrication details.

This creates:

realistic workflows
accurate quotations
better user experience
easier system scalability
4. REAL-WORLD FABRICATION WORKFLOW ALIGNMENT

This revised workflow closely matches how real aluminium fabrication companies operate.

In real fabrication businesses:

customers provide approximate dimensions
fabricators inspect requirements
technical staff select materials
quotations are manually finalized

AluMate digitizes and simplifies this process.

5. USER SIDE RESPONSIBILITIES

The customer only provides high-level information.

6. USER INPUT REQUIREMENTS
A. MAIN PRODUCT MEASUREMENTS

Users should ONLY provide:

Field	Example
Total Width	8ft
Total Height	4ft

These measurements represent:

“wall opening measurements”

NOT internal fabrication dimensions.

7. PRODUCT CONFIGURATION INPUTS

Users configure the product using simple options.

Example Inputs
Field	Example
Product Type	Sliding Window
Panel Count	2
Color	Matte Black
Environment	Outdoor
Usage Type	Heavy Daily Use
Budget Level	Standard
8. OPTIONAL CUSTOMER PREFERENCES

Users may additionally specify:

Option	Example
Sound Insulation	Required
Child Safety	Required
Privacy Glass	Required
Ventilation Priority	High
9. OPTIONAL NOTES SECTION

Users may add custom notes.

Example
Need stronger locking system
for child safety.

OR

Prefer minimal frame appearance.
10. DESIGN SOURCE OPTIONS

Users may either:

A. Create Custom Design

Using:

Fabric.js
Three.js

OR

B. Select Catalogue Design

Pre-designed products from design catalogue.

11. IMPORTANT DESIGN RULE

Catalogue designs:

can accept measurements
can accept preferences

BUT:

cannot modify structural design layout
12. WHAT USERS SHOULD NOT INPUT

The following should NOT be requested from customers:

❌ glass measurements
❌ internal frame divisions
❌ profile thickness
❌ reinforcement calculations
❌ lock placement dimensions
❌ track system calculations
❌ aluminium cut lengths

These are technical fabrication tasks.

13. SYSTEM RESPONSIBILITIES

After user submission, the system should:

Analyze User Inputs

The system evaluates:

product type
dimensions
environment
usage type
panel count
preferences
14. INTELLIGENT MATERIAL RECOMMENDATION

The system should generate:

“Suggested Material Recommendations”

NOT finalized material selections.

Example Recommendation
Category	Suggested Material
Window Profile	80mm Sliding
Glass Type	Tempered Glass
Rollers	Heavy Duty Rollers
15. RECOMMENDATION REASONING

The system should explain WHY recommendations were selected.

Example
Selected because:
• Large dimensions detected
• Outdoor installation selected
• Heavy daily usage identified
16. APPROXIMATE ESTIMATION SYSTEM

The system may generate:

preliminary estimated cost ranges

ONLY for:

customer awareness
early budgeting

NOT final quotations.

Example
Estimated Cost Range:
Rs. 120,000 – Rs. 145,000
17. QUOTATION REQUEST CREATION

After submission:

The system creates:

“Quotation Request”

Status:

Pending Admin Review
18. ADMIN SIDE RESPONSIBILITIES

Admins perform all technical validation and final calculations.

19. ADMIN REVIEW PROCESS

The admin reviews:

customer measurements
selected design
preferences
recommendation results
20. FINAL MATERIAL SELECTION

Admin confirms:

Category	Example
Aluminium Profiles	80mm Sliding
Glass Type	Tempered Glass
Accessories	Multi-lock System
Reinforcements	Required
21. TECHNICAL FABRICATION CALCULATIONS

Admins calculate:

internal frame divisions
panel sizing
glass dimensions
profile cutting lengths
reinforcement placement
hardware quantities

These calculations remain internal.

22. LABOR COST CALCULATION

Labor cost is calculated using:

product-specific square foot rates

based on:

selected profile system
product type
complexity
Example Rates
Windows
Profile Type	Rate
41mm Casement	Rs.250 / sq.ft
70mm Sliding	Rs.250 / sq.ft
80mm Sliding	Rs.350 / sq.ft
60mm Casement	Rs.300 / sq.ft
Doors
Type	Rate
100mm Sliding	Rs.750 / sq.ft
100mm Swing Door	Rs.450 / sq.ft
Pantry
Type	Rate
Pantry Bar	Rs.750 / sq.ft
23. FINAL QUOTATION GENERATION

After technical review:

Admin generates:

material breakdown
labor breakdown
installation cost
transport cost
final quotation total
24. USER QUOTATION REVIEW

Users can then:

review costs
review material recommendations
compare quotations
download PDFs
request modifications
approve quotations
25. APPROVAL WORKFLOW

If the user approves:

Quotation status becomes:

Approved

Then:

order automatically enters production workflow
26. REQUEST MODIFICATION FLOW

Instead of rejecting quotations:

Users should be able to:

“Request Modification”
Example Requests
reduce budget
change color
downgrade material
upgrade profile system
simplify design
27. WHY THIS APPROACH IS BETTER
A. More Realistic

Matches real fabrication businesses.

B. Easier For Customers

No technical knowledge required.

C. More Accurate

Technical calculations handled by experts.

D. Better User Experience

Simple input forms.

E. Easier To Develop

Avoids extremely complex automation logic.

F. Stronger Academic Value

Demonstrates:

intelligent recommendations
workflow digitization
human-assisted automation
practical software engineering
28. JUSTIFICATION OF THE AUTOMATION (ACADEMIC & TECHNICAL VALUE)

To ensure the system retains its technical innovation and "automated estimation" value for project evaluation, the automation is applied in three critical areas:

A. Instant Preliminary Estimation (Heuristic Logic)
While final costs are verified manually, the system provides an immediate "Estimated Cost Range" as soon as the user enters their basic Wall Opening dimensions. This requires a robust backend rule engine that maps simple dimensions to a complex structural heuristic model, providing immediate value to the user.

B. Admin "Auto-Fill" Assistant
The core automation shifts from a customer-facing tool to an Admin Productivity Engine. When an Admin opens a Quotation Request, the system automatically PRE-FILLS the suggested material breakdown, profile selections, and baseline labor costs based on its internal logic. The Admin acts as a reviewer, turning a 20-minute manual calculation into a 10-second validation task.

C. Human-in-the-Loop (HITL) Architecture
Complete autonomous quotation for custom structural fabrication is technically risky due to safety, structural anomalies, and physical constraints. By designing an HITL workflow, the project demonstrates enterprise-level software design where automation assists human experts (Admins) rather than irresponsibly bypassing safety checks.
29. IMPORTANT SYSTEM DESCRIPTION UPDATE

The project should officially describe this module as:

Semi-Automated Intelligent Quotation Generation System

NOT:

Fully Automated Quotation System
30. RECOMMENDED FINAL PROJECT DESCRIPTION
The system provides intelligent material recommendations
and preliminary estimations based on user inputs, while
utilizing a Human-in-the-Loop (HITL) Admin Assistant to automatically pre-calculate technical fabrication
requirements and generate finalized quotations safely.
31. FINAL WORKFLOW SUMMARY
User Selects Design
        ↓
User Enters Basic Measurements
        ↓
User Adds Preferences
        ↓
System Generates Instant Estimate & Recommendations
        ↓
Quotation Request Created
        ↓
Admin Reviews Request
        ↓
System Pre-Fills Material & Cost Calculations (Admin Assistant)
        ↓
Admin Validates & Finalizes Materials & Costs
        ↓
Final Quotation Generated
        ↓
User Reviews & Approves
        ↓
Production Workflow Begins
32. FINAL CONCLUSION

This revised quotation architecture creates:

realistic fabrication workflows
intelligent recommendation systems
practical quotation management
scalable business logic
customer-friendly interfaces
technically accurate fabrication handling

while maintaining the core innovation and strong academic automation value of the AluMate platform.