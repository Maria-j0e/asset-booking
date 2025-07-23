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
    CREATE INDEX IF NOT EXISTS idx_bookings_assetid ON bookings("assetId");
    CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
    CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);
    CREATE INDEX IF NOT EXISTS idx_assets_available ON assets(available);

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

END;
$$ LANGUAGE plpgsql;

-- Function to check if a table exists
CREATE OR REPLACE FUNCTION check_table_exists(table_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = check_table_exists.table_name
    );
END;
$$ LANGUAGE plpgsql;