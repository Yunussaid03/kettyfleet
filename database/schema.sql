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
