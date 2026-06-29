-- ======================================
-- ENABLE ROW LEVEL SECURITY
-- ======================================

alter table profiles enable row level security;

alter table vehicles enable row level security;

alter table clients enable row level security;

alter table jobs enable row level security;

alter table job_expenses enable row level security;

alter table fuel_records enable row level security;

alter table maintenance_records enable row level security;

alter table insurance_records enable row level security;

alter table inspection_records enable row level security;

alter table speed_governor_records enable row level security;

alter table rsl_records enable row level security;

create or replace function get_user_role()

returns text

language sql
security definer
stable 
    as $$
    select role 
    from profiles
    where id = auth.uid();
     $$;

--admin helper
create or replace function is_admin()
returns boolean
language sql
security definer
stable


 as $$
    select get_user_role()= 'admin';

  $$;

-- owner helper
create or replace function is_owner()
returns boolean
language sql
security definer
stable

as $$
  select get_user_role()= 'owner';
 $$;

--staff helper
create or replace function is_staff()
returns boolean
language sql
security definer
stable

as $$
  select get_user_role()= 'staff';
  $$;

--driver helper
create or replace function is_driver()
returns boolean
language sql
security definer
stable 

as $$
   select get_user_role()= 'driver';
   $$;




--POLICY IMPLEMENTATION

create policy "Users can view their own profile"
on profiles 
for select
using(
    auth.uid() = id
);

create policy "Admins can view all profiles"
on profiles 
for select
using(
    is_admin()
);

create policy "Admins can update all profiles"
on profiles 
for update 
using(
    is_admin()
);

create policy "Users can update their own profile"
on profiles 
for update
using(
    auth.uid()= id

);


--CRUD POLICIES

--vehicles
create policy "Vehicles readable by admin, owner and staff"
on vehicles
for select
using(
    is_admin() or
    is_owner() or 
    is_staff()
);

create policy "Admin can insert vehicles"
on vehicles 
for insert
with check(
    is_admin()
 );

create policy "Admin can update vehicles"
on vehicles
for update
using(
    is_admin()
);

create policy "Admin can delete vehicles"
on vehicles
for delete 
using (
    is_admin()
);


--clients
create policy "Clients readable by admin, owner and staff"
on clients 
for select
using (
    is_admin() or
    is_owner() or
    is_staff()
);

create policy "Admin and staff can insert clients"
on clients
for insert
with check(
    is_admin() or
    is_staff()
);

create policy "Admin and staff can update clients"
on clients
for update 
using (
    is_admin() or
    is_staff()
);

create policy "Admin can delete clients"
on clients
for delete
using (
    is_admin()
);

--jobs
create policy "Jobs readable by admin, owner and staff"
on jobs
for select
using (
    is_admin() or
    is_owner() or 
    is_staff()
);

create policy "Admin and staff can insert jobs"
on jobs
for insert
with check(
    is_admin() or 
    is_staff()
);

create policy "Admin and staff can update jobs"
on jobs 
for update
using (
    is_admin() or
    is_staff()
);

create policy "Admin can delete jobs"
on jobs
for delete
using (
    is_admin()
);


--job expenses
create policy "Job expenses readable by admin, owner and staff"
on job_expenses
for select
using(
    is_admin() or
    is_owner() or
    is_staff()
);

create policy "Admin and staff can insert job expenses"
on job_expenses
for insert
with check(
    is_admin() or
    is_staff()
);

create policy "Admin and staff can update job expenses"
on job_expenses 
for update
using(
    is_admin() or
    is_staff()
);

create policy "Admin can delete job expenses"
on job_expenses
for delete
using(
    is_admin()
);

--fuel records
create policy "Fuel records readable by admin, owner and staff"
on fuel_records
for select
using(
    is_admin() or
    is_owner() or
    is_staff()
);

create policy "Admin and staff can insert fuel records"
on fuel_records
for insert
with check(
    is_admin() or
    is_staff()
);

create policy "Admin and staff can update fuel records"
on fuel_records
for update
using(
    is_admin() or
    is_staff()
);

create policy "Admin can delete fuel records"
on fuel_records
for delete
using(
    is_admin()
);


--maintenance records
create policy "Maintenance records readable by admin, owner and staff"
on maintenance_records
for select
using(
    is_admin() or
    is_owner() or
    is_staff()
);

create policy "Admin and staff can insert maintenance records"
on maintenance_records
for insert
with check(
    is_admin() or
    is_staff()

);

create policy "Admin and staff can update maintenance records"
on maintenance_records
for update
using(
    is_admin() or
    is_staff()
);

create policy "Admin can delete maintenance records"
on maintenance_records
for delete
using(
    is_admin()
);

--insurance records
create policy "Insurance records readable by admin, owner and staff"
on insurance_records
for select
using(
    is_admin() or
    is_owner() or
    is_staff()
);

create policy "Admin and staff can insert insurance records"
on insurance_records
for insert
with check(
    is_admin() or
    is_staff()
);

create policy "Admin and staff can update insurance records"
on insurance_records
for update
using(
    is_admin() or
    is_staff()
);

create policy "Admin can delete insurance records"
on insurance_records
for delete
using(
    is_admin()
);

--inspection records

create policy "Inspection records readable by admin, owner and staff"
on inspection_records
for select
using(
    is_admin() or
    is_owner() or
    is_staff()
);

create policy "Admin and staff can insert inspection records"
on inspection_records
for insert
with check(
    is_admin() or
    is_staff()
);

create policy "Admin and staff can update inspection records"
on inspection_records
for update
using(
    is_admin() or
    is_staff()
);

create policy "Admin can delete inspection records"
on inspection_records
for delete
using(
    is_admin()
);

--speed governor records
create policy "Speed Governor records readable by admin, owner and staff"
on speed_governor_records
for select
using(
    is_admin() or
    is_owner() or
    is_staff()
);

create policy "Admin and staff can insert  Speed Governor records"
on speed_governor_records
for insert
with check(
    is_admin() or
    is_staff()
);

create policy "Admin and staff can update Speed Governor records"
on speed_governor_records
for update
using(
    is_admin() or
    is_staff()
);

create policy "Admin can delete Speed Governor records"
on speed_governor_records
for delete
using(
    is_admin()
);

--rsl records
create policy "RSL records readable by admin, owner and staff"
on rsl_records
for select
using(
    is_admin() or
    is_owner() or
    is_staff()
);

create policy "Admin and staff can insert RSL records"
on rsl_records
for insert
with check(
    is_admin() or
    is_staff()
);

create policy "Admin and staff can update RSL records"
on rsl_records
for update
using(
    is_admin() or
    is_staff()
);

create policy "Admin can delete RSL records"
on rsl_records
for delete
using(
    is_admin()
);
