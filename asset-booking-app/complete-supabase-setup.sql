-- Drop existing tables if they exist (for a clean setup)
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS assets;

-- Create assets table
CREATE TABLE assets (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    type VARCHAR NOT NULL,
    "calibrationStatus" VARCHAR NOT NULL,
    "lastCalibrated" TIMESTAMP WITH TIME ZONE,
    "nextCalibrationDue" TIMESTAMP WITH TIME ZONE,
    location VARCHAR,
    available BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "assetId" VARCHAR REFERENCES assets(id) NOT NULL,
    "userId" UUID NOT NULL, -- Will link to auth.users when auth is set up
    date DATE NOT NULL,
    "startTime" VARCHAR NOT NULL,
    "endTime" VARCHAR NOT NULL,
    purpose VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes for query optimization
CREATE INDEX idx_bookings_assetid ON bookings("assetId");
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_assets_available ON assets(available);

-- Setup Row Level Security (RLS)
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for assets table
DROP POLICY IF EXISTS "Allow public read access to assets" ON assets;
CREATE POLICY "Allow public read access to assets" 
    ON assets FOR SELECT 
    TO public 
    USING (true);
    
DROP POLICY IF EXISTS "Allow authenticated users to insert assets" ON assets;
CREATE POLICY "Allow authenticated users to insert assets" 
    ON assets FOR INSERT 
    TO authenticated 
    WITH CHECK (true);
    
DROP POLICY IF EXISTS "Allow authenticated users to update assets" ON assets;
CREATE POLICY "Allow authenticated users to update assets" 
    ON assets FOR UPDATE 
    TO authenticated 
    USING (true);

-- Create policies for bookings table
DROP POLICY IF EXISTS "Allow users to view all bookings" ON bookings;
CREATE POLICY "Allow users to view all bookings" 
    ON bookings FOR SELECT 
    TO public 
    USING (true);
    
DROP POLICY IF EXISTS "Allow authenticated users to create bookings" ON bookings;
CREATE POLICY "Allow authenticated users to create bookings" 
    ON bookings FOR INSERT 
    TO authenticated 
    WITH CHECK (true);
    
DROP POLICY IF EXISTS "Allow users to update their own bookings" ON bookings;
CREATE POLICY "Allow users to update their own bookings" 
    ON bookings FOR UPDATE 
    TO authenticated 
    USING ("userId" = auth.uid());
    
DROP POLICY IF EXISTS "Allow users to delete their own bookings" ON bookings;
CREATE POLICY "Allow users to delete their own bookings" 
    ON bookings FOR DELETE 
    TO authenticated 
    USING ("userId" = auth.uid());

-- Sample asset data
INSERT INTO assets (id, name, type, "calibrationStatus", "lastCalibrated", "nextCalibrationDue", location, available)
VALUES 
('A001', 'Oscilloscope Keysight DSOX1102G', 'Measurement', 'Calibrated', '2023-05-10T00:00:00Z', '2024-05-10T00:00:00Z', 'Lab 1', true),
('A002', 'Function Generator Rigol DG1022Z', 'Generator', 'Due Soon', '2023-08-15T00:00:00Z', '2023-08-15T00:00:00Z', 'Lab 2', true),
('A003', 'Digital Multimeter Fluke 87V', 'Measurement', 'Overdue', '2022-11-20T00:00:00Z', '2023-11-20T00:00:00Z', 'Lab 1', true),
('A004', 'Temperature Chamber TestEquity 107', 'Environmental', 'Overdue', '2022-12-05T00:00:00Z', '2023-12-05T00:00:00Z', 'Lab 3', true),
('A005', 'Power Supply PS-3030', 'Power', 'Not Required', NULL, NULL, 'Lab 2', true),
('A006', 'Spectrum Analyzer Rohde & Schwarz FSW', 'Measurement', 'Calibrated', '2023-06-18T00:00:00Z', '2024-06-18T00:00:00Z', 'Lab 4', true),
('A007', 'Logic Analyzer Saleae Logic Pro 16', 'Measurement', 'Calibrated', '2023-07-22T00:00:00Z', '2024-07-22T00:00:00Z', 'Lab 1', true),
('A008', 'EMC Pre-compliance Kit', 'EMC', 'Due Soon', '2023-10-30T00:00:00Z', '2024-01-30T00:00:00Z', 'Lab 4', true),
('A009', 'Network Analyzer HP 8753E', 'Measurement', 'Overdue', '2022-10-15T00:00:00Z', '2023-10-15T00:00:00Z', 'Lab 3', false),
('A010', 'Soldering Station Weller WX2', 'Equipment', 'Not Required', NULL, NULL, 'Workshop', true);

-- Sample booking data (using placeholder user IDs - you may want to update these)
INSERT INTO bookings ("assetId", "userId", date, "startTime", "endTime", purpose)
VALUES 
('A009', '00000000-0000-0000-0000-000000000001', '2023-12-05', '09:00', '12:00', 'Network testing for Project Alpha'),
('A003', '00000000-0000-0000-0000-000000000002', '2023-12-05', '14:00', '16:00', 'Circuit verification'),
('A001', '00000000-0000-0000-0000-000000000001', '2023-12-06', '10:00', '15:00', 'Signal analysis for Project Beta');