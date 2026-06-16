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