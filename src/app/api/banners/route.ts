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
    
    // Format the response for frontend consumption
    const formattedBanners = {
      'main-web': bannerImages?.filter(img => img.banner_id === 'main-web').map(img => ({
        id: img.id,
        imageUrl: img.image_url,
        filename: img.filename,
        displayOrder: img.display_order,
        isActive: img.is_active,
        createdAt: img.created_at
      })) || [],
      'main-mobile': bannerImages?.filter(img => img.banner_id === 'main-mobile').map(img => ({
        id: img.id,
        imageUrl: img.mobile_image_url,
        filename: img.filename,
        displayOrder: img.display_order,
        isActive: img.is_active,
        createdAt: img.created_at
      })) || [],
      'promotion-web': bannerImages?.filter(img => img.banner_id === 'promotion-web').map(img => ({
        id: img.id,
        imageUrl: img.image_url,
        filename: img.filename,
        displayOrder: img.display_order,
        isActive: img.is_active,
        createdAt: img.created_at
      })) || [],
      'promotion-mobile': bannerImages?.filter(img => img.banner_id === 'promotion-mobile').map(img => ({
        id: img.id,
        imageUrl: img.mobile_image_url,
        filename: img.filename,
        displayOrder: img.display_order,
        isActive: img.is_active,
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