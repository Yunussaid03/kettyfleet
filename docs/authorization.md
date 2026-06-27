# Authorization Model

## Overview

The KettyFleet ERP uses a **Role-Based Access Control (RBAC)** model to ensure that users can only perform actions appropriate to their responsibilities within the organization.

Authentication is handled by **Supabase Auth**, while user roles and business permissions are managed separately within the application's `profiles` table.

This separation allows the authentication provider to verify user identity while the application determines what each authenticated user is permitted to access or modify.

---

# Authentication vs Authorization

## Authentication

Authentication verifies the identity of a user attempting to access the system.

The KettyFleet ERP uses Supabase Authentication to manage:

* User login
* Password management
* Session management
* Secure user identification

Authentication answers the question:

> **"Who is this user?"**

---

## Authorization

Authorization determines which resources an authenticated user is allowed to access and which actions they are permitted to perform.

Authorization is implemented using the `profiles` table together with Row Level Security (RLS) policies.

Authorization answers the question:

> **"What is this user allowed to do?"**

---

# User Roles

The system currently supports four user roles.

## Owner

The Owner has strategic oversight of the business.

Responsibilities include:

* Viewing company performance
* Viewing fleet status
* Viewing compliance reports
* Viewing financial summaries
* Monitoring operational activities

The Owner is not expected to perform daily operational tasks or manage system administration.

---

## Admin

The Admin manages the day-to-day operation of the fleet.

Responsibilities include:

* Managing vehicles
* Creating and managing jobs (CDOs)
* Assigning vehicles
* Assigning drivers
* Recording maintenance
* Recording fuel transactions
* Managing compliance records
* Creating and managing users
* Managing system configuration

The Admin has full system privileges.

---

## Staff

Staff members support operational activities.

Responsibilities include:

* Creating jobs (CDOs)
* Updating vehicle movements
* Recording fuel information
* Recording maintenance information
* Uploading insurance renewals
* Uploading inspection certificates
* Uploading RSL records
* Uploading Speed Governor renewals

Staff members cannot administer the system or manage user accounts.

---

## Driver

Drivers exist within the system primarily for assignment purposes.

Version 1 of the ERP does not provide drivers with direct operational access.

Drivers may receive additional capabilities in future versions, including:

* Viewing assigned jobs
* Submitting expenses
* Uploading fuel receipts
* Completing trip reports

---

# Permission Matrix

| Feature                       | Admin |   Owner  |  Staff  | Driver |
| ----------------------------- | :---: | :------: | :-----: | :----: |
| View Dashboard                |   ✅   |     ✅    |    ✅    |    ❌   |
| View Vehicles                 |   ✅   |     ✅    |    ✅    |    ❌   |
| Add Vehicles                  |   ✅   |     ❌    |    ❌    |    ❌   |
| Edit Vehicles                 |   ✅   | Limited* |    ❌    |    ❌   |
| Delete Vehicles               |   ✅   | Limited* |    ❌    |    ❌   |
| Create Jobs (CDO)             |   ✅   |     ❌    |    ✅    |    ❌   |
| Edit Jobs                     |   ✅   |     ❌    |    ✅    |    ❌   |
| Close Jobs                    |   ✅   |     ❌    |    ✅    |    ❌   |
| Record Fuel                   |   ✅   |     ❌    |    ✅    |    ❌   |
| Record Maintenance            |   ✅   |     ❌    |    ✅    |    ❌   |
| Upload Insurance              |   ✅   |     ❌    |    ✅    |    ❌   |
| Upload Inspection             |   ✅   |     ❌    |    ✅    |    ❌   |
| Upload Speed Governor Records |   ✅   |     ❌    |    ✅    |    ❌   |
| Upload RSL Records            |   ✅   |     ❌    |    ✅    |    ❌   |
| View Compliance Reports       |   ✅   |     ✅    |    ✅    |    ❌   |
| View Financial Summary        |   ✅   |     ✅    | Limited |    ❌   |
| Create Users                  |   ✅   |     ❌    |    ❌    |    ❌   |
| Manage User Roles             |   ✅   |     ❌    |    ❌    |    ❌   |
| System Settings               |   ✅   |     ❌    |    ❌    |    ❌   |

**Limited** indicates that the Owner may perform these actions only in exceptional operational circumstances and not as part of normal daily workflow.

---

# Business Rules

The authorization model follows the following principles:

* Authentication is managed exclusively by Supabase Auth.
* Business roles are maintained in the `profiles` table.
* Every authenticated user must have exactly one application role.
* Vehicles are the central entity of the ERP and are referenced throughout the system.
* Compliance records are historical records and should be preserved for auditing purposes.
* Staff members may create and update operational records but may not administer the system.
* Administrative functions such as user management and system configuration are restricted to Admin users.
* Drivers are modeled as system users to support future platform expansion without requiring major architectural changes.

---

# Future Expansion

The authorization model has been designed to support future enhancements without requiring database redesign.

Planned future capabilities include:

* Driver self-service portal
* Department-based permissions
* Fine-grained permission management
* Multi-branch fleet operations
* Approval workflows for finance and compliance
* Audit logging and activity history

---

# Design Philosophy

The KettyFleet ERP follows the principle of **separation of concerns**.

Authentication, authorization, business logic, and operational data are intentionally separated into independent layers to improve maintainability, scalability, and long-term system evolution.

This authorization model provides the foundation for implementing secure Row Level Security (RLS) policies in Supabase during subsequent development phases.
