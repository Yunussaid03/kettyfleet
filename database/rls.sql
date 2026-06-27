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



