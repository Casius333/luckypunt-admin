'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'

export default function SetupDatabasePage() {
  const [setupStatus, setSetupStatus] = useState<{
    exec_sql: 'pending' | 'running' | 'success' | 'error'
    banners: 'pending' | 'running' | 'success' | 'error'
    banner_images: 'pending' | 'running' | 'success' | 'error'
    storage: 'pending' | 'running' | 'success' | 'error'
  }>({
    exec_sql: 'pending',
    banners: 'pending',
    banner_images: 'pending',
    storage: 'pending'
  })
  const [logs, setLogs] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string>('')
  const supabase = createClientComponentClient()

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const createExecSqlFunction = async () => {
    setSetupStatus(prev => ({ ...prev, exec_sql: 'running' }))
    addLog('Testing exec_sql function...')
    
    try {
      const { error: testError } = await supabase.rpc('exec_sql', {
        query: 'SELECT 1'
      })
      
      if (!testError) {
        addLog('✅ exec_sql function is available')
        setSetupStatus(prev => ({ ...prev, exec_sql: 'success' }))
        return true
      }
      
      addLog('❌ exec_sql function not available - needs manual setup in Supabase SQL Editor')
      setSetupStatus(prev => ({ ...prev, exec_sql: 'error' }))
      return false
    } catch (error) {
      addLog(`❌ Error testing exec_sql: ${error}`)
      setSetupStatus(prev => ({ ...prev, exec_sql: 'error' }))
      return false
    }
  }

  const createBannersTable = async () => {
    setSetupStatus(prev => ({ ...prev, banners: 'running' }))
    addLog('Creating banners table...')
    
    try {
      const { error } = await supabase.rpc('exec_sql', {
        query: `
          CREATE TABLE IF NOT EXISTS banners (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              name VARCHAR(255) NOT NULL,
              description TEXT,
              image_url TEXT,
              mobile_image_url TEXT,
              banner_type VARCHAR(50) NOT NULL CHECK (banner_type IN ('main', 'promotion', 'announcement')),
              is_active BOOLEAN DEFAULT true,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              created_by UUID REFERENCES auth.users(id)
          );
          
          ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
          
          DROP POLICY IF EXISTS "Allow authenticated users to view active banners" ON banners;
          CREATE POLICY "Allow authenticated users to view active banners" ON banners
              FOR SELECT TO authenticated
              USING (is_active = true);
          
          DROP POLICY IF EXISTS "Allow admins to manage banners" ON banners;
          CREATE POLICY "Allow admins to manage banners" ON banners
              FOR ALL TO authenticated
              USING (
                  EXISTS (
                      SELECT 1 FROM admin_users au
                      WHERE au.id = auth.uid()
                      AND au.role IN ('admin', 'super_admin')
                  )
              );
          
          GRANT SELECT ON banners TO authenticated;
          GRANT ALL ON banners TO service_role;
        `
      })

      if (error) {
        addLog(`❌ Error creating banners table: ${error.message}`)
        setSetupStatus(prev => ({ ...prev, banners: 'error' }))
        return false
      }

      addLog('✅ Banners table created successfully')
      setSetupStatus(prev => ({ ...prev, banners: 'success' }))
      return true
    } catch (error) {
      addLog(`❌ Error creating banners table: ${error}`)
      setSetupStatus(prev => ({ ...prev, banners: 'error' }))
      return false
    }
  }

  const createBannerImagesTable = async () => {
    setSetupStatus(prev => ({ ...prev, banner_images: 'running' }))
    addLog('Creating banner_images table for carousel functionality...')
    
    try {
      const { error } = await supabase.rpc('exec_sql', {
        query: `
          CREATE TABLE IF NOT EXISTS banner_images (
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
          
          CREATE INDEX IF NOT EXISTS idx_banner_images_banner_id ON banner_images(banner_id);
          CREATE INDEX IF NOT EXISTS idx_banner_images_order ON banner_images(banner_id, display_order);
          CREATE INDEX IF NOT EXISTS idx_banner_images_active ON banner_images(banner_id, is_active);
          
          ALTER TABLE banner_images ENABLE ROW LEVEL SECURITY;
          
          DROP POLICY IF EXISTS "Allow authenticated users to view active banner images" ON banner_images;
          CREATE POLICY "Allow authenticated users to view active banner images" ON banner_images
              FOR SELECT TO authenticated
              USING (is_active = true);
          
          DROP POLICY IF EXISTS "Allow admins to manage banner images" ON banner_images;
          CREATE POLICY "Allow admins to manage banner images" ON banner_images
              FOR ALL TO authenticated
              USING (
                  EXISTS (
                      SELECT 1 FROM admin_users au
                      WHERE au.id = auth.uid()
                      AND au.role IN ('admin', 'super_admin')
                  )
              );
          
          GRANT SELECT ON banner_images TO authenticated;
          GRANT ALL ON banner_images TO service_role;
        `
      })

      if (error) {
        addLog(`❌ Error creating banner_images table: ${error.message}`)
        setSetupStatus(prev => ({ ...prev, banner_images: 'error' }))
        setMessage(`Error creating banner_images table: ${error.message}`)
        return false
      }

      addLog('✅ banner_images table created successfully!')
      setSetupStatus(prev => ({ ...prev, banner_images: 'success' }))
      setMessage('banner_images table created successfully! You can now upload banner images.')
      return true
    } catch (error) {
      addLog(`❌ Error creating banner_images table: ${error}`)
      setSetupStatus(prev => ({ ...prev, banner_images: 'error' }))
      setMessage(`Error creating banner_images table: ${error}`)
      return false
    }
  }

  const setupStorage = async () => {
    setSetupStatus(prev => ({ ...prev, storage: 'running' }))
    addLog('Setting up storage bucket...')
    
    try {
      // Check if banners bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
      
      if (bucketsError) {
        addLog(`❌ Error checking storage buckets: ${bucketsError.message}`)
        setSetupStatus(prev => ({ ...prev, storage: 'error' }))
        return false
      }

      const bannersBucket = buckets?.find(bucket => bucket.name === 'banners')
      
      if (!bannersBucket) {
        addLog('❌ Banners storage bucket not found - please create it manually in Supabase Dashboard')
        setSetupStatus(prev => ({ ...prev, storage: 'error' }))
        return false
      }

      addLog('✅ Storage bucket setup verified')
      setSetupStatus(prev => ({ ...prev, storage: 'success' }))
      return true
    } catch (error) {
      addLog(`❌ Error setting up storage: ${error}`)
      setSetupStatus(prev => ({ ...prev, storage: 'error' }))
      return false
    }
  }

  const runFullSetup = async () => {
    setIsLoading(true)
    setLogs([])
    setMessage('')
    
    addLog('Starting full database setup...')
    
    // Run setup functions in sequence
    const execSqlResult = await createExecSqlFunction()
    if (!execSqlResult) {
      setIsLoading(false)
      return
    }
    
    const bannersResult = await createBannersTable()
    if (!bannersResult) {
      setIsLoading(false)
      return
    }
    
    const bannerImagesResult = await createBannerImagesTable()
    if (!bannerImagesResult) {
      setIsLoading(false)
      return
    }
    
    await setupStorage()
    
    addLog('✅ Full setup completed!')
    setMessage('Database setup completed successfully!')
    setIsLoading(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'running':
        return <Clock className="h-5 w-5 text-blue-600 animate-spin" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Database Setup</h1>
        <Button onClick={runFullSetup} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
          <Database className="h-4 w-4 mr-2" />
          {isLoading ? 'Setting up...' : 'Run Full Setup'}
        </Button>
      </div>

      <Card className="p-6 bg-yellow-50 border-yellow-200">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Database Setup</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Set up the required database tables for banner management. Run this setup once to initialize everything.
            </p>
          </div>
        </div>
      </Card>

      {/* Setup Status */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Exec Function</p>
              <p className="text-xs text-gray-600 mt-1">Database function</p>
            </div>
            {getStatusIcon(setupStatus.exec_sql)}
          </div>
          <Button 
            size="sm" 
            className="mt-3 w-full" 
            onClick={createExecSqlFunction}
            disabled={setupStatus.exec_sql === 'running'}
          >
            Test Function
          </Button>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Banners Table</p>
              <p className="text-xs text-gray-600 mt-1">Basic banners</p>
            </div>
            {getStatusIcon(setupStatus.banners)}
          </div>
          <Button 
            size="sm" 
            className="mt-3 w-full" 
            onClick={createBannersTable}
            disabled={setupStatus.banners === 'running'}
          >
            Create Table
          </Button>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Banner Images</p>
              <p className="text-xs text-gray-600 mt-1">Carousel table</p>
            </div>
            {getStatusIcon(setupStatus.banner_images)}
          </div>
          <Button 
            size="sm" 
            className="mt-3 w-full" 
            onClick={createBannerImagesTable}
            disabled={setupStatus.banner_images === 'running'}
          >
            Create Table
          </Button>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Storage</p>
              <p className="text-xs text-gray-600 mt-1">Image storage</p>
            </div>
            {getStatusIcon(setupStatus.storage)}
          </div>
          <Button 
            size="sm" 
            className="mt-3 w-full" 
            onClick={setupStorage}
            disabled={setupStatus.storage === 'running'}
          >
            Check Storage
          </Button>
        </Card>
      </div>

      {/* Status Message */}
      {message && (
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {message.includes('✅') ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">Status</h3>
              <div className="mt-1 text-sm text-gray-600">
                {message}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Setup Logs */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Setup Logs</h2>
          <div className="bg-gray-50 rounded-lg p-4 max-h-80 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-sm text-gray-600">No logs yet. Click "Run Full Setup" to begin.</p>
            ) : (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="text-sm font-mono text-gray-800">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
} 