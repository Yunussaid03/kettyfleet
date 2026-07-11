# Database

This folder contains the complete database setup for the KettyFleet ERP system.

## Files

### schema.sql

Creates the database structure, including:

* Tables
* Primary keys
* Foreign keys
* Constraints
* Relationships

This file should be executed first on a new Supabase project.

---

### seeds.sql

Inserts sample development data used for testing the application.

Current seed data includes:

* Sample vehicles
* Sample clients

This file is intended for development only and should not contain real company data.

---

### rls.sql

Configures database security.

It includes:

* Row Level Security (RLS)
* Helper functions
* Role-based access control (RBAC)
* Security policies for every table

This file should be executed after `schema.sql`.

---

## Database Setup Order

For a fresh database:

1. Run `schema.sql`
2. Run `seeds.sql`
3. Run `rls.sql`

---

## User Roles

The system currently supports four user roles:

* Admin
* Owner
* Staff
* Driver

Permissions are enforced using Supabase Row Level Security (RLS).

---

## Core Modules

The database currently supports:

* User Profiles
* Vehicles
* Clients
* Jobs (CDO)
* Job Expenses
* Fuel Records
* Maintenance Records
* Insurance Records
* Inspection Records
* Speed Governor Records
* Road Service Licence (RSL) Records

---

## Development Notes

Business rules such as job workflow, fuel validation, and expense validation are enforced through a combination of:

* Database constraints
* Row Level Security (RLS)
* Application logic

This approach keeps the database secure while allowing business workflows to evolve without unnecessary database complexity.


## Version

v1.0