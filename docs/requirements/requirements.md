# KettyFleet ERP — Software Requirements Specification (SRS)

---

## 1. Introduction

### 1.1 Purpose
This document defines the functional and non-functional requirements for the KettyFleet ERP system, a fleet operations management platform designed for tour operators.

### 1.2 Scope
The system provides tools for managing:
- Fleet inventory
- Compliance tracking
- Job (CDO) operations
- Driver activities
- Maintenance records
- Fuel efficiency
- Operational reporting

---

## 2. Overall Description

### 2.1 Product Perspective
KettyFleet is a web-based ERP system built using a modern frontend framework and a cloud-hosted backend database. It replaces manual spreadsheet-based fleet tracking with a centralized digital system.

---

### 2.2 User Classes

#### Admin
Responsible for all system operations including fleet, compliance, jobs, maintenance, and reporting.

#### Owner
Read-only access to dashboards, summaries, and analytics.

#### Staff (Master Role)
Limited operational input role responsible for daily vehicle status updates.

---

## 3. Functional Requirements

---

### 3.1 Fleet Management

The system shall:
- Store vehicle details including internal ID and registration number
- Categorize vehicles by type
- Track vehicle operational status
- Maintain historical vehicle records

---

### 3.2 Compliance Management

The system shall:
- Track multiple compliance types per vehicle
- Store expiry dates for each compliance record
- Provide alerts for upcoming expiries
- Support document uploads for certificates

Compliance types include:
- Insurance
- NTSA Inspection
- Speed Governor Certification
- Road Service License (RSL)

---

### 3.3 Job (CDO) System

The system shall:
- Create and manage jobs (CDO records)
- Assign vehicles and drivers to jobs
- Track job lifecycle (active, completed, closed)
- Store client and job type information
- Link all operational data to a job

Job types include:
- Safari Tours
- Transfers
- City Tours

---

### 3.4 Driver Operations

The system shall:
- Record trip-related driver activity
- Track allowances and expenses
- Link driver data to jobs
- Store trip completion records

---

### 3.5 Maintenance Management

The system shall:
- Record maintenance and repair activities
- Track workshop information
- Store maintenance costs and payment methods
- Maintain historical maintenance logs per vehicle

---

### 3.6 Fuel Tracking

The system shall:
- Record fuel fill-up data
- Track odometer readings
- Calculate fuel efficiency per vehicle
- Monitor fuel costs over time

---

### 3.7 Daily Vehicle Reporting (Master Role)

The system shall:
- Allow staff to submit daily vehicle status updates
- Record mileage, usage, and vehicle condition
- Capture operational issues or incidents
- Provide visibility of vehicle movement to admins

---

### 3.8 Reporting & Dashboard

The system shall:
- Provide fleet overview dashboards
- Display compliance status summaries
- Show fuel and maintenance cost analytics
- Generate monthly operational summaries

---

## 4. Non-Functional Requirements

- The system shall be responsive and usable on desktop devices
- The system shall maintain data integrity across all modules
- The system shall enforce role-based access control
- The system shall ensure fast retrieval of dashboard data
- The system shall support scalable data growth for expanding fleet size

---

## 5. Constraints

- The system will use Supabase as backend infrastructure
- The frontend will be built using React and Tailwind CSS
- No external backend server (Node.js) is used in Version 1

---

## 6. Assumptions

- Users have basic digital literacy
- Vehicles are uniquely identifiable by registration number and internal ID
- All operational data is entered by authorized staff only

---

## 7. Summary

KettyFleet ERP is designed as a structured fleet operations system with a job-centric architecture that ensures full traceability of vehicles, drivers, expenses, and compliance across all operational activities.