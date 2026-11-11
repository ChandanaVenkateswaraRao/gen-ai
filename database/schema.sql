-- ==============================================================================
-- HostelIQ AI: Production Database Schema (Supabase PostgreSQL + pgvector)
-- University Hostel & Mess Management Assistant
-- ==============================================================================

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Users and Profiles
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'admin')),
    room_number TEXT,
    block_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Approved Institutional Policy Documents
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Rules & Discipline', 'Mess & Dining', 'Facilities & Maintenance', 'Hostel Admissions', 'General Notice')),
    status TEXT NOT NULL DEFAULT 'indexed' CHECK (status IN ('processing', 'indexed', 'error')),
    chunk_count INT DEFAULT 0,
    error_message TEXT,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Vector Chunks for Grounded RAG Retrieval (768 dimensions for text-embedding-004)
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    page_number INT DEFAULT 1,
    chunk_index INT NOT NULL,
    embedding vector(768),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Mess Menu Schedules
CREATE TABLE IF NOT EXISTS mess_menus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')),
    meal_type TEXT NOT NULL CHECK (meal_type IN ('Breakfast','Lunch','Snacks','Dinner')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    dietary_info JSONB DEFAULT '{"veg": true, "non_veg": false, "dairy": true, "jain": false}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(day_of_week, meal_type)
);

-- 6. Official Hostel Announcements & Circulars
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('General', 'Maintenance', 'Mess', 'Urgent')),
    priority TEXT NOT NULL CHECK (priority IN ('Normal', 'High', 'Urgent')),
    is_pinned BOOLEAN DEFAULT FALSE,
    target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'students', 'admins')),
    author_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Complaints and Grievance Lifecycle Tracking
CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracking_id TEXT UNIQUE NOT NULL,
    student_id UUID REFERENCES users(id) ON DELETE SET NULL,
    student_name TEXT NOT NULL,
    room_number TEXT NOT NULL,
    block_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Electrical', 'Plumbing', 'Carpentry', 'Cleanliness', 'Mess', 'Internet', 'Other')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
    status TEXT NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected')),
    admin_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Audit Logs & Document Ingestion Trail
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'success',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Semantic Similarity Search Function (pgvector RPC)
CREATE OR REPLACE FUNCTION match_document_chunks (
    query_embedding vector(768),
    match_threshold FLOAT DEFAULT 0.60,
    match_count INT DEFAULT 4
)
RETURNS TABLE (
    id UUID,
    document_id UUID,
    document_title TEXT,
    content TEXT,
    page_number INT,
    chunk_index INT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id,
        dc.document_id,
        d.title AS document_title,
        dc.content,
        dc.page_number,
        dc.chunk_index,
        1 - (dc.embedding <=> query_embedding) AS similarity
    FROM document_chunks dc
    JOIN documents d ON d.id = dc.document_id
    WHERE d.status = 'indexed'
      AND (1 - (dc.embedding <=> query_embedding)) >= match_threshold
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
