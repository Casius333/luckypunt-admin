-- Create banners table
CREATE TABLE banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,           -- Admin reference name
    description TEXT,                     -- Admin notes/description
    
    -- Images
    image_url TEXT,              -- Desktop image
    mobile_image_url TEXT,       -- Mobile image
    thumbnail_url TEXT,          -- Admin preview
    
    -- Configuration
    banner_type VARCHAR(50) NOT NULL CHECK (banner_type IN ('main', 'promotion', 'announcement')),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create updated_at trigger for banners
CREATE TRIGGER update_banners_updated_at
    BEFORE UPDATE ON banners
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_banners_type_active ON banners(banner_type, is_active);

-- Enable RLS
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow authenticated users to view active banners" ON banners
    FOR SELECT TO authenticated
    USING (is_active = true);

CREATE POLICY "Allow admins to manage banners" ON banners
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.role IN ('admin', 'super_admin')
        )
    );

-- Grant permissions
GRANT SELECT ON banners TO authenticated;
GRANT ALL ON banners TO service_role; 