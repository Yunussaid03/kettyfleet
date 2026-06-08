# KettyFleet ERP System Architecture

## 1. System Overview

KettyFleet ERP is a fleet operations management system designed for tour operators. The system centralizes vehicle tracking, compliance management, job scheduling (CDO system), maintenance records, fuel efficiency tracking, and operational reporting.

The platform is built for two primary users:
- Admin (full operational control)
- Owner (read-only strategic overview)
- Staff (limited daily operational updates via Master Role)

The system is designed as a modular ERP with a strong focus on vehicle-centric operations and job-based tracking.

---

## 2. High-Level Architecture

KettyFleet follows a modern web-based client-server architecture:

Frontend:
- React (UI layer)
- Tailwind CSS (styling)
- React Router (navigation)

Backend (BaaS):
- Supabase
  - PostgreSQL Database
  - Authentication
  - File Storage (for documents like insurance certificates)

Deployment:
- Frontend: Vercel (or similar static hosting)
- Backend: Supabase Cloud

---

## 3. Core Architectural Principles

### 3.1 Modular Design
The system is divided into functional modules:
- Fleet Management
- Compliance Management
- Job (CDO) System
- Maintenance Management
- Fuel Tracking
- Reporting & Dashboard

Each module operates independently but shares a central database.

---

### 3.2 Vehicle-Centric Data Model
All operational data revolves around vehicles.

Every key record links back to:
- Vehicle ID (internal system ID)
- Registration Number (business identifier)

This ensures traceability across all operations.

---

### 3.3 Job-Based Operations Model (CDO System)
All operational activity is structured around a Job (CDO).

A Job includes:
- Vehicle assignment
- Driver assignment
- Client information
- Job type (Safari / Transfer / City Tour)
- Expenses (fuel, tolls, allowances)
- Status tracking

This ensures all operational and financial data is traceable per job.

---

### 3.4 Role-Based Access Control (RBAC)

The system supports three roles:

#### Admin
- Full CRUD access across system
- Manages fleet, compliance, jobs, maintenance, and reporting

#### Owner
- Read-only access
- Views dashboards, reports, and summaries

#### Staff (Master Role)
- Can submit daily vehicle updates
- Limited access to assigned vehicles only

---

## 4. Data Architecture (Supabase PostgreSQL)

The database is structured around the following core entities:

- users
- vehicles
- jobs (CDO)
- job_assignments
- compliance_records
- maintenance_records
- fuel_records
- vehicle_daily_reports

Relationships are designed using foreign keys to ensure data integrity.

---

## 5. Compliance System Design

Compliance is handled as a unified tracking system for multiple document types:

- Insurance
- NTSA Inspection
- Speed Governor Certification
- Road Service License (RSL)
- Number Plate Registration

Each compliance record includes:
- Vehicle reference
- Expiry date
- Status (Valid / Expiring / Expired)
- Document upload support (certificate storage)

---

## 6. Operational Data Flow

### Example Workflow:

1. Admin creates Job (CDO)
2. Vehicle and driver assigned
3. Job executed (trip occurs)
4. Staff submits daily vehicle updates (Master Role)
5. Fuel and expenses recorded
6. Maintenance logged if needed
7. Job closed
8. Owner views summary dashboard

---

## 7. Reporting & Analytics Layer

The system supports:

- Vehicle performance reports
- Fuel efficiency tracking (km/l)
- Maintenance cost analysis
- Job profitability overview (future enhancement)
- Monthly operational summaries

Reports are designed for:
- Operational decision making (Admin)
- Strategic overview (Owner)

---

## 8. File Storage Strategy

Supabase Storage is used for:
- Insurance certificates
- Compliance documents
- Maintenance receipts (future)

Files are linked to database records via URLs.

---

## 9. Scalability Considerations

The system is designed to be extendable:

Future modules may include:
- Finance & Accounting
- HR Management
- Booking Portal for Clients
- Mobile Driver App
- GPS Tracking Integration

However, these are explicitly out of scope for Version 1.

---

## 10. Summary

KettyFleet ERP is built as a modular, vehicle-centric operations system with a strong job-based architecture (CDO system). It prioritizes operational clarity, compliance tracking, and cost visibility for fleet managers and owners.

The system is designed to be simple in interface, but structured like an enterprise ERP under the hood.