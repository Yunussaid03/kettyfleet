insert into vehicles (

  vehicle_code,
    registration_number,
    vehicle_type,
    category,
    manufacture_year,
    passenger_capacity,
    ownership_type,
    status,
    logbook_number,
    current_mileage,
    notes

)

values(
  (
  'V001',
  'KBW 146L',
  'Land Cruiser',
  '4WD',
  2019,
  5,
  'company',
  'active',
  'LOG123456789',
  120000,
  'Safari vehicle'
),
(
  'V002',
  'KDA 482M',
  'Toyota Hiace',
  'Van',
  2021,
  14,
  'company',
  'maintenance',
  'LOG987654321',
  86000,
  'Currently undergoing engine service'
),
(
  'V003',
  'KCY 731P',
  'Nissan Caravan',
  'Van',
  2017,
  11,
  'company',
  'inactive',
  'LOG456789123',
  175000,
  'Temporarily inactive'
),
(
  'V004',
  'KDK 215R',
  'Toyota Prado',
  '4WD',
  2022,
  7,
  'leased',
  'active',
  'LOG741852963',
  45000,
  'Leased luxury transfer vehicle'
),
(
  'V005',
  'KBR 908T',
  'Toyota Noah',
  'MPV',
  2015,
  7,
  'company',
  'sold',
  'LOG369258147',
  210000,
  'Sold vehicle retained for historical records'
);


insert into clients(
    client_name,
    client_type,
    phone,
    email,
    notes
)
values(
    'Pollmans Tours',
    'company',
    '+254700000000',
    'operations@pollmans.com',
    'Corporate tour partner'
);