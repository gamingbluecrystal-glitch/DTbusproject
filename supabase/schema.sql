-- ====================================================================
-- SmartBus – Schedule-Based Bus Tracking & ETA System
-- Supabase / PostgreSQL Database Schema
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Bus Stops Table
CREATE TABLE IF NOT EXISTS stops (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    local_name VARCHAR(255), -- Marathi / Hindi name
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    zone VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Buses Table
CREATE TABLE IF NOT EXISTS buses (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    bus_number VARCHAR(50) NOT NULL UNIQUE,
    plate_number VARCHAR(50) NOT NULL UNIQUE,
    model VARCHAR(100) NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 40,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Routes Table
CREATE TABLE IF NOT EXISTS routes (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    route_number VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    origin_stop_id TEXT REFERENCES stops(id) ON DELETE RESTRICT,
    destination_stop_id TEXT REFERENCES stops(id) ON DELETE RESTRICT,
    via TEXT,
    color VARCHAR(20) DEFAULT '#0284c7',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Route Stops Sequence Table
CREATE TABLE IF NOT EXISTS route_stops (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    route_id TEXT NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    stop_id TEXT NOT NULL REFERENCES stops(id) ON DELETE CASCADE,
    sequence_order INTEGER NOT NULL,
    approx_minutes_from_prev INTEGER DEFAULT 5,
    distance_km DOUBLE PRECISION DEFAULT 2.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (route_id, sequence_order),
    UNIQUE (route_id, stop_id)
);

-- 5. Trips Table
CREATE TABLE IF NOT EXISTS trips (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    trip_number VARCHAR(50) NOT NULL,
    route_id TEXT NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    bus_id TEXT NOT NULL REFERENCES buses(id) ON DELETE RESTRICT,
    direction VARCHAR(10) NOT NULL DEFAULT 'UP' CHECK (direction IN ('UP', 'DOWN')),
    days_of_week INTEGER[] DEFAULT '{0,1,2,3,4,5,6}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Timetables (Halts) Table
CREATE TABLE IF NOT EXISTS timetables (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    stop_id TEXT NOT NULL REFERENCES stops(id) ON DELETE CASCADE,
    arrival_time TIME NOT NULL,
    departure_time TIME NOT NULL,
    sequence_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (trip_id, stop_id),
    UNIQUE (trip_id, sequence_order)
);

-- 7. Admins / Users Table
CREATE TABLE IF NOT EXISTS system_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin', 'operator')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for lightning fast ETA lookups
CREATE INDEX IF NOT EXISTS idx_timetables_arrival_time ON timetables(arrival_time);
CREATE INDEX IF NOT EXISTS idx_timetables_trip_id ON timetables(trip_id);
CREATE INDEX IF NOT EXISTS idx_route_stops_route_id ON route_stops(route_id);
CREATE INDEX IF NOT EXISTS idx_trips_route_bus ON trips(route_id, bus_id);

-- Row Level Security (RLS) policies
ALTER TABLE stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetables ENABLE ROW LEVEL SECURITY;

-- Allow public read access (passenger app needs to view schedule data)
CREATE POLICY "Public read stops" ON stops FOR SELECT USING (true);
CREATE POLICY "Public read buses" ON buses FOR SELECT USING (true);
CREATE POLICY "Public read routes" ON routes FOR SELECT USING (true);
CREATE POLICY "Public read route_stops" ON route_stops FOR SELECT USING (true);
CREATE POLICY "Public read trips" ON trips FOR SELECT USING (true);
CREATE POLICY "Public read timetables" ON timetables FOR SELECT USING (true);

-- Allow authenticated admins to insert/update/delete
CREATE POLICY "Admins modify stops" ON stops FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins modify buses" ON buses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins modify routes" ON routes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins modify route_stops" ON route_stops FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins modify trips" ON trips FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins modify timetables" ON timetables FOR ALL USING (auth.role() = 'authenticated');
