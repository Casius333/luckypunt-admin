-- Create promotions table
CREATE TABLE IF NOT EXISTS promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Bonus configuration
    bonus_percent DECIMAL(5,2) NOT NULL,
    max_bonus_amount DECIMAL(10,2),
    min_deposit_amount DECIMAL(10,2),
    wagering_multiplier DECIMAL(5,2),
    max_withdrawal_amount DECIMAL(10,2),
    
    -- Promotion configuration
    promotion_type VARCHAR(50) DEFAULT 'deposit_bonus' CHECK (promotion_type IN ('deposit_bonus', 'free_bonus', 'cashback', 'free_spins', 'reload_bonus')),
    
    -- Scheduling
    start_at TIMESTAMP WITH TIME ZONE,
    end_at TIMESTAMP WITH TIME ZONE,
    
    -- Eligibility
    user_eligibility_rules JSONB DEFAULT '{}',
    usage_limit_per_user INTEGER DEFAULT 1,
    total_usage_limit INTEGER,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Analytics
    total_activated INTEGER DEFAULT 0,
    total_completed INTEGER DEFAULT 0,
    total_bonus_awarded DECIMAL(12,2) DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create user_promotions table for tracking user participation
CREATE TABLE IF NOT EXISTS user_promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    promotion_id UUID REFERENCES promotions(id),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired', 'cancelled')),
    bonus_amount DECIMAL(10,2),
    wagering_requirement DECIMAL(10,2),
    wagering_progress DECIMAL(10,2) DEFAULT 0,
    activated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    expired_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, promotion_id)
);

-- Create triggers for updated_at
CREATE TRIGGER update_promotions_updated_at
    BEFORE UPDATE ON promotions
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_user_promotions_updated_at
    BEFORE UPDATE ON user_promotions
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_promotions_active ON promotions(is_active);
CREATE INDEX idx_promotions_dates ON promotions(start_at, end_at);
CREATE INDEX idx_promotions_type ON promotions(promotion_type);
CREATE INDEX idx_user_promotions_user_id ON user_promotions(user_id);
CREATE INDEX idx_user_promotions_promotion_id ON user_promotions(promotion_id);
CREATE INDEX idx_user_promotions_status ON user_promotions(status);

-- Enable RLS
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_promotions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for promotions
CREATE POLICY "Allow authenticated users to view active promotions" ON promotions
    FOR SELECT TO authenticated
    USING (is_active = true);

CREATE POLICY "Allow admins to manage promotions" ON promotions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.role IN ('admin', 'super_admin')
        )
    );

-- Create RLS policies for user_promotions
CREATE POLICY "Allow users to view their own promotions" ON user_promotions
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Allow admins to view all user promotions" ON user_promotions
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Allow users to update their own promotions" ON user_promotions
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Allow admins to manage all user promotions" ON user_promotions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.role IN ('admin', 'super_admin')
        )
    );

-- Grant permissions
GRANT SELECT ON promotions TO authenticated;
GRANT ALL ON promotions TO service_role;
GRANT SELECT ON user_promotions TO authenticated;
GRANT ALL ON user_promotions TO service_role; 