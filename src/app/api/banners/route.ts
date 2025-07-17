import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const bannerType = searchParams.get('type') // main-web, main-mobile, promotion-web, promotion-mobile
    
    let query = supabase
      .from('banner_images')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
    
    // Filter by banner type if specified
    if (bannerType) {
      query = query.eq('banner_id', bannerType)
    }
    
    const { data: bannerImages, error } = await query
    
    if (error) {
      console.error('Error fetching banner images:', error)
      return NextResponse.json(
        { error: 'Failed to fetch banner images' },
        { status: 500 }
      )
    }
    
    // Filter by current day for promotional banners with day scheduling
    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    const filteredBanners = bannerImages?.filter(banner => {
      // If this is a promotional banner and has day scheduling
      if (banner.banner_id?.includes('promotion') && banner.is_day_scheduled) {
        // Only include if the current day matches the banner's scheduled days
        const scheduleDays = banner.schedule_days || []
        return scheduleDays.includes(currentDay)
      }
      // For non-promotional banners, include all
      return true
    }) || []
    
    // Format the response for frontend consumption
    const formattedBanners = {
      'main-web': filteredBanners?.filter(img => img.banner_id === 'main-web').map(img => ({
        id: img.id,
        imageUrl: img.image_url,
        filename: img.filename,
        displayOrder: img.display_order,
        isActive: img.is_active,
        scheduleDays: img.schedule_days,
        isDayScheduled: img.is_day_scheduled,
        createdAt: img.created_at
      })) || [],
      'main-mobile': filteredBanners?.filter(img => img.banner_id === 'main-mobile').map(img => ({
        id: img.id,
        imageUrl: img.mobile_image_url,
        filename: img.filename,
        displayOrder: img.display_order,
        isActive: img.is_active,
        scheduleDays: img.schedule_days,
        isDayScheduled: img.is_day_scheduled,
        createdAt: img.created_at
      })) || [],
      'promotion-web': filteredBanners?.filter(img => img.banner_id === 'promotion-web').map(img => ({
        id: img.id,
        imageUrl: img.image_url,
        filename: img.filename,
        displayOrder: img.display_order,
        isActive: img.is_active,
        scheduleDays: img.schedule_days,
        isDayScheduled: img.is_day_scheduled,
        createdAt: img.created_at
      })) || [],
      'promotion-mobile': filteredBanners?.filter(img => img.banner_id === 'promotion-mobile').map(img => ({
        id: img.id,
        imageUrl: img.mobile_image_url,
        filename: img.filename,
        displayOrder: img.display_order,
        isActive: img.is_active,
        scheduleDays: img.schedule_days,
        isDayScheduled: img.is_day_scheduled,
        createdAt: img.created_at
      })) || []
    }
    
    // If specific type requested, return just that type
    if (bannerType && formattedBanners[bannerType as keyof typeof formattedBanners]) {
      return NextResponse.json({
        success: true,
        data: formattedBanners[bannerType as keyof typeof formattedBanners]
      })
    }
    
    // Return all types
    return NextResponse.json({
      success: true,
      data: formattedBanners
    })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 