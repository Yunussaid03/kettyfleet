create table profiles (
    id uuid primary key references auth.users(id) on delete cascade,  /*authenticated supabase user*/
    
    
    full_name text not null,

    phone text,

    role text not null check(
        role in ('admin', 'owner', 'staff', 'driver')

    ),

    is_active boolean default true,

    created_at timestamptz default now(),

    updated_at timestamptz default now()

);

--vehicles 
create table vehicles (

  id uuid primary key default gen_random_uuid(),

  vehicle_code text unique,   --ie V001

  registration_number text unique not null,   --KBW 123

  vehicle_type text not null,

  category text,

  manufacture_year int,

  passenger_capacity int,

  ownership_type text,
  -- company/private/leased

  status text default 'active',
  -- active/maintenance/sold/inactive

  logbook_number text,

  current_mileage int default 0,

  notes text,

  created_at timestamptz default now(),

  updated_at timestamptz default now()
  
);

--clients
create table clients(
    id uuid primary key default gen_random_uuid(),

    client_name text  not null,

    client_type text not null check(
        client_type in ('company', 'individual')
    ),

    phone text, 

    email text,

    notes text,

    created_at timestamptz default now(),

    updated_at timestamptz default now()

);

-- jobs
create table jobs(

  id uuid primary key default gen_random_uuid(),

  cdo_number text unique not null,

  client_id uuid references clients(id),
  vehicle_id uuid references vehicles(id),
  driver_id uuid references profiles(id),

  job_type text,

  status text default 'scheduled',

  start_date date,
  end_date date,

  pickup_location text,
  destination text,

  notes text,

  created_by uuid references profiles(id),

  created_at timestamptz default now(),
  updated_at timestamptz default now()
  
);

-- jobs expenses
create table job_expenses (
  id uuid primary key default gen_random_uuid(),

  job_id uuid references jobs(id) on delete cascade,

  expense_type text not null,

  amount numeric (12,2) not null,
  description text,

  expense_date date,
  
  created_by uuid references profiles(id),

  created_at timestamptz default now()

);

-- fuel records

create table fuel_records(
  
  id uuid primary key default gen_random_uuid(),

  vehicle_id uuid not null references vehicles(id),
  job_id uuid references jobs(id),

  fillup_date date not null,

  odometer_before integer not null,
  odometer_after integer not null,

  fuel_amount_litres numeric(10,2) not null,
  fuel_cost_per_litres numeric(10,2) not null,
  
  km_covered integer,
  fuel_efficiency numeric(10,2),

  fuel_station text,
  invoice_number text,
  notes text,

  created_at timestamptz default now()

);

--maintenance records
create table maintenance_records(

  id uuid primary key default gen_random_uuid(),

  vehicle_id uuid not null references vehicles(id),
  maintencance_date date not null,

  item_type text not null,
  --items like tyres,radiator

  description text,

  cost numeric(12,2) not null,
  
  payment_method text,
  service_provider text,

  mechanic_name text,
  odometer_at_service integer,

  notes text,

  created_at timestamptz default now()
);

--vehicle insurance records
create table insurance_records(
   id uuid primary key default gen_random_uuid(),

   vehicle_id uuid not null references vehicles(id),
   
   insurance_company text not null ,
   policy_number text,
   
   cover_type text not null,
   -- PSV TPO, Comprehensive, Third Party, etc.

   premium_amount numeric(12,2),
   start_date date not null,
   expiry_date date not null,
   certificate_url text,
   status text default 'active',
   -- active, expired, cancelled

   notes text,
   created_at timestamptz default now()
);

-- inspection records
create table inspection_records(

   id uuid primary key default gen_random_uuid(),
   vehicle_id uuid not null references vehicles(id),

   booking_date date,

   inspection_date date,
   inspection_center text,

   result text,

   expiry_date text,

   certificate_url text,

   notes text,

   created_at timestamptz default now()



);

--speed governor records

create table speed_governor_records(
  id uuid primary key default gen_random_uuid(),

  vehicle_id uuid not null references vehicles(id),

  vendor text not null,
  installation_date date not null,

  expiry_date date,
  certificate_url text,

  status text default 'active',

  notes text,
  created_at timestamptz default now()
);

-- road service license
create table rsl_records (
    id uuid primary key default gen_random_uuid(),

    vehicle_id uuid not null references vehicles(id),

    application_date date,

    issue_date date,

    valid_from date,

    valid_until date not null,

    issuing_authority text default 'NTSA',
    -- usually government authority

    certificate_url text,

    status text default 'active',
    -- active, expired, pending, revoked

    notes text,

    created_at timestamptz default now()
);

ALTER TABLE jobs
ADD CONSTRAINTS job_status_check
CHECK (status IN('scheduled', 'active', 'completed', 'cancelled'));

