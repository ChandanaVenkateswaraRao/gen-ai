-- ==============================================================================
-- HostelIQ AI: Institutional Seed Data
-- Label: [Demonstration Data Mode]
-- ==============================================================================

-- 1. Institutional Users
INSERT INTO users (id, email, full_name, role, room_number, block_name)
VALUES 
    ('a0000000-0000-0000-0000-000000000001', 'warden@university.edu', 'Prof. Arthur Pendelton (Chief Warden)', 'admin', 'Office-101', 'Administrative Block'),
    ('s0000000-0000-0000-0000-000000000001', 'rohan.sharma@student.edu', 'Rohan Sharma', 'student', 'B-304', 'Block B (Aryabhatta Hall)'),
    ('s0000000-0000-0000-0000-000000000002', 'ananya.iyer@student.edu', 'Ananya Iyer', 'student', 'G-112', 'Block G (Gargi Hall)')
ON CONFLICT (email) DO NOTHING;

-- 2. Approved Policy Documents
INSERT INTO documents (id, title, file_name, file_size, category, status, chunk_count, uploaded_by)
VALUES 
    (
        'd0000000-0000-0000-0000-000000000001', 
        'Hostel Rules & Regulations Handbook 2026', 
        'Hostel_Rules_and_Regulations_2026.pdf', 
        248500, 
        'Rules & Discipline', 
        'indexed', 
        8, 
        'a0000000-0000-0000-0000-000000000001'
    ),
    (
        'd0000000-0000-0000-0000-000000000002', 
        'Mess Dining Guidelines & Rebate Policy 2026', 
        'Mess_Guidelines_and_Rebate_Policy_2026.pdf', 
        154200, 
        'Mess & Dining', 
        'indexed', 
        5, 
        'a0000000-0000-0000-0000-000000000001'
    ),
    (
        'd0000000-0000-0000-0000-000000000003', 
        'Hostel Maintenance & Electrical Appliance Policy', 
        'Electrical_and_Maintenance_Policy.pdf', 
        98400, 
        'Facilities & Maintenance', 
        'indexed', 
        4, 
        'a0000000-0000-0000-0000-000000000001'
    )
ON CONFLICT (id) DO NOTHING;

-- 3. Weekly Mess Menu Matrix (Monday - Sunday)
INSERT INTO mess_menus (day_of_week, meal_type, start_time, end_time, items, dietary_info)
VALUES 
    -- Monday
    ('Monday', 'Breakfast', '07:30', '09:30', '["Idli & Medu Vada", "Coconut Chutney & Sambar", "Bread Butter Jam", "Tea & Coffee", "Boiled Eggs / Banana"]'::jsonb, '{"veg": true, "egg": true, "dairy": true, "jain": true}'::jsonb),
    ('Monday', 'Lunch', '12:15', '14:15', '["Rajma Masala (Punjabi style)", "Jeera Rice", "Chapati (Whole wheat)", "Aloo Gobhi Sabzi", "Boondi Raita", "Green Salad"]'::jsonb, '{"veg": true, "egg": false, "dairy": true, "jain": false}'::jsonb),
    ('Monday', 'Snacks', '17:00', '18:15', '["Vegetable Poha", "Roasted Peanuts & Sev", "Ginger Tea & Coffee"]'::jsonb, '{"veg": true, "egg": false, "dairy": true, "jain": true}'::jsonb),
    ('Monday', 'Dinner', '19:45', '21:45', '["Dal Tadka", "Steamed Basmati Rice", "Paneer Butter Masala", "Mix Veg Korma", "Tawa Roti", "Gulab Jamun (1 pc)"]'::jsonb, '{"veg": true, "egg": false, "dairy": true, "jain": false}'::jsonb),

    -- Tuesday
    ('Tuesday', 'Breakfast', '07:30', '09:30', '["Aloo Paratha with Curd", "Pickle", "Sprouts Salad", "Bread Butter", "Tea & Coffee"]'::jsonb, '{"veg": true, "egg": false, "dairy": true, "jain": false}'::jsonb),
    ('Tuesday', 'Lunch', '12:15', '14:15', '["Chole Masala", "Bhature / Steamed Rice", "Yellow Moong Dal", "Cucumber Onion Salad", "Sweet Lassi"]'::jsonb, '{"veg": true, "egg": false, "dairy": true, "jain": false}'::jsonb),
    ('Tuesday', 'Snacks', '17:00', '18:15', '["Bread Pakoda with Mint Chutney", "Biscuits", "Masala Tea & Coffee"]'::jsonb, '{"veg": true, "egg": false, "dairy": true, "jain": false}'::jsonb),
    ('Tuesday', 'Dinner', '19:45', '21:45', '["Egg Curry (for non-veg) / Kadhai Paneer (for veg)", "Dal Makhani", "Jeera Rice", "Phulka Roti", "Ice Cream Cup"]'::jsonb, '{"veg": true, "egg": true, "dairy": true, "jain": false}'::jsonb),

    -- Wednesday
    ('Wednesday', 'Breakfast', '07:30', '09:30', '["Masala Dosa with Sambar", "Tomato Chutney", "Oatmeal Porridge", "Boiled Eggs", "Tea & Coffee"]'::jsonb, '{"veg": true, "egg": true, "dairy": true, "jain": true}'::jsonb),
    ('Wednesday', 'Lunch', '12:15', '14:15', '["Kadhi Pakora", "Khichdi & Steamed Rice", "Bhindi Do Pyaza", "Papad", "Pudina Raita"]'::jsonb, '{"veg": true, "egg": false, "dairy": true, "jain": false}'::jsonb),
    ('Wednesday', 'Snacks', '17:00', '18:15', '["Corn Chaat (Butter Salt & Pepper)", "Filter Coffee & Green Tea"]'::jsonb, '{"veg": true, "egg": false, "dairy": true, "jain": true}'::jsonb),
    ('Wednesday', 'Dinner', '19:45', '21:45', '["Chicken Curry (for non-veg) / Malai Kofta (for veg)", "Dal Fry", "Peas Pulao", "Tandoori Roti", "Fruit Custard"]'::jsonb, '{"veg": true, "egg": false, "dairy": true, "jain": false}'::jsonb),

    -- Thursday
    ('Thursday', 'Breakfast', '07:30', '09:30', '["Poori with Aloo Bhaji", "Suji Halwa", "Cut Fresh Papaya", "Tea & Coffee"]'::jsonb, '{"veg": true, "egg": false, "dairy": true, "jain": false}'::jsonb),
    ('Thursday', 'Lunch', '12:15', '14:15', '["Dal Palak", "Veg Kolhapuri", "Steamed Rice", "Chapati", "Plain Curd", "Kachumber Salad"]'::jsonb, '{"veg": true, "egg": false, "dairy": true, "jain": false}'::jsonb),
    ('Thursday', 'Snacks', '17:00', '18:15', '["Veg Cutlet with Tomato Ketchup", "Tea & Coffee"]'::jsonb, '{"veg": true, "egg": false, "dairy": true, "jain": true}'::jsonb),
    ('Thursday', 'Dinner', '19:45', '21:45', '["Sambar", "Curd Rice & Lemon Rice", "Potato Fry (Sukha)", "Chapati", "Semiyan Kheer"]'::jsonb, '{"veg": true, "egg": false, "dairy": true, "jain": true}'::jsonb),

    -- Friday
    ('Friday', 'Breakfast', '07:30', '09:30', '["Veg Upma with Coconut Chutney", "Boiled Chana Chaat", "Bread Omelette / Jam", "Tea & Coffee"]'::jsonb, '{"veg": true, "egg": true, "dairy": true, "jain": false}'::jsonb),
    ('Friday', 'Lunch', '12:15', '14:15', '["Veg Biryani with Mirchi ka Salan", "Dal Tadka", "Raita", "Chapati", "Roasted Papad"]'::jsonb, '{"veg": true, "egg": false, "dairy": true, "jain": false}'::jsonb),
    ('Friday', 'Snacks', '17:00', '18:15', '["Samosa with Tamarind Chutney", "Chai & Lemon Tea"]'::jsonb, '{"veg": true, "egg": false, "dairy": true, "jain": false}'::jsonb),
    ('Friday', 'Dinner', '19:45', '21:45', '["Fish Curry / Shahi Paneer", "Dal Makhani", "Jeera Rice", "Butter Roti", "Moong Dal Halwa"]'::jsonb, '{"veg": true, "egg": false, "dairy": true, "jain": false}'::jsonb),

    -- Saturday
    ('Saturday', 'Breakfast', '07:30', '10:00', '["Uttapam (Onion & Tomato)", "Sambar & Chutney", "Boiled Eggs / Bananas", "Tea & Coffee"]'::jsonb, '{"veg": true, "egg": true, "dairy": true, "jain": true}'::jsonb),
    ('Saturday', 'Lunch', '12:15', '14:30', '["Kashmiri Dum Aloo", "Panchratan Dal", "Steamed Rice", "Phulka Roti", "Dahi Vada"]'::jsonb, '{"veg": true, "egg": false, "dairy": true, "jain": false}'::jsonb),
    ('Saturday', 'Snacks', '17:00', '18:15', '["Bhelpuri / Sev Puri", "Tea & Coffee"]'::jsonb, '{"veg": true, "egg": false, "dairy": false, "jain": false}'::jsonb),
    ('Saturday', 'Dinner', '19:45', '21:45', '["Pav Bhaji with Butter Pav", "Veg Pulao with Raita", "Green Salad", "Rasgulla (1 pc)"]'::jsonb, '{"veg": true, "egg": false, "dairy": true, "jain": false}'::jsonb),

    -- Sunday
    ('Sunday', 'Breakfast', '08:00', '10:30', '["Paneer Paratha & Butter", "Curd & Pickle", "Cornflakes with Hot/Cold Milk", "Tea & Coffee"]'::jsonb, '{"veg": true, "egg": false, "dairy": true, "jain": false}'::jsonb),
    ('Sunday', 'Lunch', '12:30', '14:45', '["Hyderabadi Chicken Biryani / Paneer Dum Biryani", "Mirchi Ka Salan", "Mix Veg Raita", "Onion Lemon Salad", "Gulab Jamun"]'::jsonb, '{"veg": true, "egg": true, "dairy": true, "jain": false}'::jsonb),
    ('Sunday', 'Snacks', '17:00', '18:15', '["Biscuits & Rusks", "Filter Coffee & Masala Chai"]'::jsonb, '{"veg": true, "egg": false, "dairy": true, "jain": true}'::jsonb),
    ('Sunday', 'Dinner', '19:45', '21:45', '["Light Khichdi / Steamed Rice", "Yellow Moong Dal", "Aloo Beans Sabzi", "Tawa Phulka", "Seasonal Fresh Fruit"]'::jsonb, '{"veg": true, "egg": false, "dairy": true, "jain": true}'::jsonb)
ON CONFLICT (day_of_week, meal_type) DO UPDATE 
SET items = EXCLUDED.items, dietary_info = EXCLUDED.dietary_info, updated_at = NOW();

-- 4. Official Announcements
INSERT INTO announcements (id, title, content, category, priority, is_pinned, target_audience, author_name)
VALUES 
    (
        'c0000000-0000-0000-0000-000000000001',
        'Mandatory Curfew Verification & Late Entry Gate Pass Protocol',
        'All resident students are reminded that the main hostel gates close strictly at 10:30 PM. Any student requiring entry after 10:30 PM for genuine academic lab work or emergency travel must submit an approved Digital Late Pass signed by their project guide and hostel warden at least 4 hours in advance.',
        'Urgent',
        'Urgent',
        TRUE,
        'all',
        'Prof. Arthur Pendelton (Chief Warden)'
    ),
    (
        'c0000000-0000-0000-0000-000000000002',
        'Scheduled Electrical Maintenance in Block B & C',
        'Routine maintenance and transformer testing will be conducted on Saturday between 09:00 AM and 01:00 PM. High-power appliances are strictly prohibited. Emergency elevator and corridor lighting will remain on backup inverter power.',
        'Maintenance',
        'High',
        FALSE,
        'all',
        'Estate Office (Electrical Wing)'
    ),
    (
        'c0000000-0000-0000-0000-000000000003',
        'Mess Rebate Application Deadline for End-Semester Break',
        'Students leaving the campus for vacation must apply for mess rebate on the student portal at least 3 days prior to departure. A minimum continuous absence of 4 days is mandatory to qualify for dining bill deductions.',
        'Mess',
        'Normal',
        FALSE,
        'students',
        'Mess Council Office'
    )
ON CONFLICT (id) DO NOTHING;

-- 5. Realistic Complaints with DB-confirmed tracking codes
INSERT INTO complaints (id, tracking_id, student_id, student_name, room_number, block_name, category, title, description, priority, status, admin_notes)
VALUES 
    (
        'e0000000-0000-0000-0000-000000000001',
        'CMP-2026-0041',
        's0000000-0000-0000-0000-000000000001',
        'Rohan Sharma',
        'B-304',
        'Block B (Aryabhatta Hall)',
        'Plumbing',
        'Bathroom tap leakage causing continuous water drip',
        'The cold water washbasin faucet in room B-304 does not shut off completely, wasting water and creating continuous dripping noise.',
        'Medium',
        'In Progress',
        'Plumber Jagdish assigned on Oct 27; replacement ceramic cartridge requisitioned.'
    ),
    (
        'e0000000-0000-0000-0000-000000000002',
        'CMP-2026-0042',
        's0000000-0000-0000-0000-000000000001',
        'Rohan Sharma',
        'B-304',
        'Block B (Aryabhatta Hall)',
        'Internet',
        'LAN port 2 connectivity intermittent',
        'Study table wall ethernet port drops packets after 10-15 minutes of continuous connection. WiFi signal on 3rd floor west wing is also weak.',
        'Low',
        'Submitted',
        NULL
    ),
    (
        'e0000000-0000-0000-0000-000000000003',
        'CMP-2026-0038',
        's0000000-0000-0000-0000-000000000002',
        'Ananya Iyer',
        'G-112',
        'Block G (Gargi Hall)',
        'Electrical',
        'Ceiling fan regulator sparking on speed 3',
        'The ceiling fan speed regulator is sparking when turned to speeds 3 and 4. Needs immediate replacement before use.',
        'High',
        'Resolved',
        'Electrician Mohan replaced faulty rotary switch with modular dimmer on Oct 26. Verified working safely.'
    )
ON CONFLICT (id) DO NOTHING;
