-- Create banner_images table for carousel functionality
CREATE TABLE banner_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    banner_id VARCHAR(50) NOT NULL,      -- Reference to banner type (main-web, main-mobile, etc.)
    image_url TEXT,                      -- Desktop image URL
    mobile_image_url TEXT,               -- Mobile image URL  
    display_order INTEGER DEFAULT 0,     -- Order in carousel
    is_active BOOLEAN DEFAULT true,      -- Whether image is active
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create updated_at trigger for banner_images
CREATE TRIGGER update_banner_images_updated_at
    BEFORE UPDATE ON banner_images
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_banner_images_banner_id ON banner_images(banner_id);
CREATE INDEX idx_banner_images_order ON banner_images(banner_id, display_order);
CREATE INDEX idx_banner_images_active ON banner_images(banner_id, is_active);

-- Enable RLS
ALTER TABLE banner_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow authenticated users to view active banner images" ON banner_images
    FOR SELECT TO authenticated
    USING (is_active = true);

CREATE POLICY "Allow admins to manage banner images" ON banner_images
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.role IN ('admin', 'super_admin')
        )
    );

-- Grant permissions
GRANT SELECT ON banner_images TO authenticated;
GRANT ALL ON banner_images TO service_role; 