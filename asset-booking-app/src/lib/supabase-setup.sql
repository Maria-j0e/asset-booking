-- Function to initialize database tables and RLS policies
CREATE OR REPLACE FUNCTION init_database_tables()
RETURNS void AS $$
BEGIN
    -- Create assets table if it doesn't exist
    CREATE TABLE IF NOT EXISTS assets (
        id VARCHAR PRIMARY KEY,
        name VARCHAR NOT NULL,
        type VARCHAR NOT NULL,
        calibrationStatus VARCHAR NOT NULL,
        lastCalibrated TIMESTAMP WITH TIME ZONE,
        nextCalibrationDue TIMESTAMP WITH TIME ZONE,
        location VARCHAR,
        available BOOLEAN NOT NULL DEFAULT TRUE
    );
    
    -- Create bookings table if it doesn't exist
    CREATE TABLE IF NOT EXISTS bookings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        assetId VARCHAR REFERENCES assets(id) NOT NULL,
        userId UUID NOT NULL, -- Will link to auth.users when auth is set up
        date DATE NOT NULL,
        startTime VARCHAR NOT NULL,
        endTime VARCHAR NOT NULL,
        purpose VARCHAR NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
    );

    -- Create indexes for query optimization
    CREATE INDEX IF NOT EXISTS idx_bookings_assetid ON bookings(assetId);
    CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
    CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);
    CREATE INDEX IF NOT EXISTS idx_assets_available ON assets(available);

    -- Setup Row Level Security (RLS)
    -- For assets table - everyone can read, but only authenticated users can modify
    ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "assets_select_policy" ON assets;
    CREATE POLICY "assets_select_policy" ON assets 
        FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "assets_insert_update_policy" ON assets;
    CREATE POLICY "assets_insert_update_policy" ON assets 
        FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    
    DROP POLICY IF EXISTS "assets_update_policy" ON assets;
    CREATE POLICY "assets_update_policy" ON assets 
        FOR UPDATE USING (auth.role() = 'authenticated');
    
    -- For bookings table
    ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "bookings_select_policy" ON bookings;
    CREATE POLICY "bookings_select_policy" ON bookings 
        FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "bookings_insert_policy" ON bookings;
    CREATE POLICY "bookings_insert_policy" ON bookings 
        FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    
    DROP POLICY IF EXISTS "bookings_update_policy" ON bookings;
    CREATE POLICY "bookings_update_policy" ON bookings 
        FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = userId);

END;
$$ LANGUAGE plpgsql;

-- Call the function to ensure tables and policies are created
SELECT init_database_tables();