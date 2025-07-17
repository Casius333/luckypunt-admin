'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  Plus, 
  Upload, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  Image as ImageIcon,
  Info,
  Monitor,
  Smartphone,
  X,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Calendar
} from 'lucide-react'

interface BannerImage {
  id: string
  banner_id: string
  image_url: string
  mobile_image_url?: string
  filename?: string
  display_order: number
  is_active: boolean
  schedule_days?: string[]
  is_day_scheduled?: boolean
  created_at: string
  updated_at: string
}



interface PendingImage {
  id: string
  file: File
  order: number
  isActive: boolean
  section: string
  scheduleDays?: string[]
  isDayScheduled?: boolean
}

interface BannerSection {
  type: 'main-web' | 'main-mobile' | 'promotion-web' | 'promotion-mobile'
  title: string
  subtitle: string
  specs: string
  bgColor: string
  iconColor: string
  borderColor: string
  icon: any
  images: BannerImage[]
}

// Modal for managing individual banner carousel
function BannerCarouselModal({ 
  section, 
  isOpen, 
  onClose,
  onSave
}: {
  section: BannerSection
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}) {
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([])
  const [saving, setSaving] = useState(false)
  const supabase = createClientComponentClient()

  if (!isOpen) return null

  const uploadImage = async (file: File, path: string) => {
    try {
      console.log('🔍 Upload attempt:', { fileName: file.name, filePath: path, fileSize: file.size })
      
      // Test basic supabase connection first
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      console.log('👤 Current user:', user?.email, authError ? 'AUTH ERROR' : 'OK')
      
      if (authError) {
        throw new Error(`Authentication failed: ${authError.message}`)
      }
      
      console.log('📦 Attempting storage upload...')
      const { data, error } = await supabase.storage
        .from('banners')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Storage upload error details:', {
          error,
          message: error.message,
          errorObject: JSON.stringify(error, null, 2)
        })
        throw new Error(`Storage upload failed: ${error.message || JSON.stringify(error)}`)
      }

      console.log('Upload successful:', data)

      const { data: { publicUrl } } = supabase.storage
        .from('banners')
        .getPublicUrl(data.path)

      console.log('Generated public URL:', publicUrl)
      return publicUrl
    } catch (error) {
      console.error('Upload exception:', error)
      throw error
    }
  }

  const handleAddImages = (files: FileList | null) => {
    if (!files) return
    
    const newImages = Array.from(files).map((file, index) => ({
      id: `pending-${Date.now()}-${index}`,
      file,
      order: section.images.length + pendingImages.length + index,
      isActive: true,
      section: section.type,
      scheduleDays: section.type.includes('promotion') ? [] : undefined,
      isDayScheduled: section.type.includes('promotion') ? true : false
    }))
    
    setPendingImages([...pendingImages, ...newImages])
  }

  const updatePendingImageDays = (imageId: string, days: string[]) => {
    setPendingImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, scheduleDays: days } : img
    ))
  }

  const getUsedDays = (excludeImageId?: string) => {
    // Get days used by existing images (excluding the one being edited)
    const existingDays = section.images
      .filter(img => img.id !== excludeImageId && img.schedule_days && img.schedule_days.length > 0)
      .flatMap(img => img.schedule_days || [])
    
    // Get days used by pending images (excluding the one being edited)
    const pendingDays = pendingImages
      .filter(img => img.id !== excludeImageId && img.scheduleDays && img.scheduleDays.length > 0)
      .flatMap(img => img.scheduleDays || [])
    
    return [...existingDays, ...pendingDays]
  }

  const updateExistingImageDays = async (imageId: string, days: string[]) => {
    try {
      const { error } = await supabase
        .from('banner_images')
        .update({
          schedule_days: days,
          is_day_scheduled: true
        })
        .eq('id', imageId)

      if (error) {
        console.error('Error updating image days:', error)
        alert('Failed to update image days')
        return false
      }

      // Update local state
      const updatedImages = section.images.map(img => 
        img.id === imageId 
          ? { ...img, schedule_days: days, is_day_scheduled: true }
          : img
      )
      
      // Refresh the data
      await onSave()
      return true
    } catch (error) {
      console.error('Error updating image days:', error)
      alert('Failed to update image days')
      return false
    }
  }

  const removePendingImage = (id: string) => {
    setPendingImages(pendingImages.filter(img => img.id !== id))
  }

  const handleSaveCarousel = async () => {
    if (pendingImages.length === 0) {
      alert('Please add at least one image')
      return
    }
    
    // Validate that promotional banners have day assignments and no conflicts
    if (section.type.includes('promotion')) {
      const imagesWithoutDays = pendingImages.filter(img => !img.scheduleDays || img.scheduleDays.length === 0)
      if (imagesWithoutDays.length > 0) {
        alert('Please assign days to all promotional banner images')
        return
      }
      
      // Check for day conflicts among pending images
      const allPendingDays = pendingImages.flatMap(img => img.scheduleDays || [])
      const uniqueDays = [...new Set(allPendingDays)]
      if (allPendingDays.length !== uniqueDays.length) {
        alert('Multiple images cannot be assigned to the same day')
        return
      }
      
      // Check for conflicts with existing images
      const existingDays = section.images.flatMap(img => img.schedule_days || [])
      const conflictingDays = allPendingDays.filter(day => existingDays.includes(day))
      if (conflictingDays.length > 0) {
        alert(`The following days are already taken: ${conflictingDays.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}`)
        return
      }
    }

    console.log('🚀 Starting carousel save process...')
    console.log('Pending images:', pendingImages.length)
    console.log('Section:', section.type)
    console.log('Pending images details:', pendingImages.map(img => ({
      id: img.id,
      fileName: img.file.name,
      fileSize: img.file.size,
      fileType: img.file.type,
      section: img.section,
      order: img.order,
      isActive: img.isActive
    })))
    
    setSaving(true)
    
    try {
      let successCount = 0
      
      for (const pendingImage of pendingImages) {
        try {
          console.log(`📤 Processing image: ${pendingImage.file.name}`)
          console.log('📦 File details:', {
            name: pendingImage.file.name,
            size: pendingImage.file.size,
            type: pendingImage.file.type,
            lastModified: pendingImage.file.lastModified
          })
          
          // Upload image
          const imagePath = `${Date.now()}-${pendingImage.section}-${pendingImage.file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
          console.log('📁 Upload path:', imagePath)
          
          console.log('🔄 Calling uploadImage function...')
          const imageUrl = await uploadImage(pendingImage.file, imagePath)
          console.log('✅ Upload successful, URL:', imageUrl)
          
          // Determine if this is a mobile image based on section
          const isMobile = pendingImage.section.includes('mobile')
          console.log('📱 Is mobile section:', isMobile)
          
          // Insert image record
          const insertData = {
            banner_id: pendingImage.section, // Use section type as banner_id
            image_url: isMobile ? null : imageUrl,
            mobile_image_url: isMobile ? imageUrl : null,
            filename: pendingImage.file.name, // Store original filename
            display_order: pendingImage.order,
            is_active: pendingImage.isActive,
            schedule_days: pendingImage.scheduleDays || null,
            is_day_scheduled: pendingImage.isDayScheduled || false
          }
          
          console.log('💾 Inserting banner image:', insertData)
          
          const { data: insertResult, error } = await supabase
            .from('banner_images')
            .insert(insertData)
            .select()

          if (error) {
            console.error('❌ Database insertion error:', {
              error,
              message: error.message,
              errorObject: JSON.stringify(error, null, 2),
              code: error.code,
              details: error.details,
              hint: error.hint
            })
            throw new Error(`Database insertion failed: ${error.message || JSON.stringify(error)}`)
          }
          
          console.log('✅ Database insertion successful:', insertResult)
          successCount++
        } catch (imageError) {
          console.error(`❌ Failed to upload ${pendingImage.file.name}:`, {
            imageError,
            message: imageError instanceof Error ? imageError.message : 'Unknown error',
            errorObject: JSON.stringify(imageError, null, 2),
            stack: imageError instanceof Error ? imageError.stack : undefined
          })
          // Continue with other images
        }
      }

      console.log(`📊 Upload summary: ${successCount} successful out of ${pendingImages.length} total`)

      if (successCount > 0) {
        alert(`Successfully uploaded ${successCount} of ${pendingImages.length} images!`)
        setPendingImages([])
        onSave() // Refresh parent data
        onClose()
      } else {
        alert('Failed to upload any images. Please check your connection and try again.')
      }
    } catch (error) {
      console.error('❌ Error saving carousel:', error)
      alert(`Error uploading images: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  const toggleExistingImage = async (imageId: string) => {
    try {
      const image = section.images.find(img => img.id === imageId)
      if (!image) return

      const { error } = await supabase
        .from('banner_images')
        .update({ is_active: !image.is_active })
        .eq('id', imageId)

      if (error) {
        console.error('Error toggling image status:', error)
        throw error
      }

      onSave() // Refresh parent data
    } catch (error) {
      console.error('Error toggling image status:', error)
      alert('Error updating image status')
    }
  }

  const deleteExistingImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return

    try {
      const { error } = await supabase
        .from('banner_images')
        .delete()
        .eq('id', imageId)

      if (error) {
        console.error('Error deleting image:', error)
        throw error
      }

      onSave() // Refresh parent data
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('Error deleting image')
    }
  }



  const moveImageUp = async (imageId: string) => {
    const sortedImages = section.images.sort((a, b) => a.display_order - b.display_order)
    const currentIndex = sortedImages.findIndex(img => img.id === imageId)
    
    if (currentIndex <= 0) return // Can't move up if it's already first
    
    const currentImage = sortedImages[currentIndex]
    const targetImage = sortedImages[currentIndex - 1]
    
    try {
      // Swap the display_order values
      await Promise.all([
        supabase.from('banner_images').update({ display_order: targetImage.display_order }).eq('id', currentImage.id),
        supabase.from('banner_images').update({ display_order: currentImage.display_order }).eq('id', targetImage.id)
      ])
      
      onSave() // Refresh parent data
    } catch (error) {
      console.error('Error moving image up:', error)
      alert('Error reordering image')
    }
  }

  const moveImageDown = async (imageId: string) => {
    const sortedImages = section.images.sort((a, b) => a.display_order - b.display_order)
    const currentIndex = sortedImages.findIndex(img => img.id === imageId)
    
    if (currentIndex >= sortedImages.length - 1) return // Can't move down if it's already last
    
    const currentImage = sortedImages[currentIndex]
    const targetImage = sortedImages[currentIndex + 1]
    
    try {
      // Swap the display_order values
      await Promise.all([
        supabase.from('banner_images').update({ display_order: targetImage.display_order }).eq('id', currentImage.id),
        supabase.from('banner_images').update({ display_order: currentImage.display_order }).eq('id', targetImage.id)
      ])
      
      onSave() // Refresh parent data
    } catch (error) {
      console.error('Error moving image down:', error)
      alert('Error reordering image')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${section.bgColor}`}>
                <section.icon className={`h-6 w-6 ${section.iconColor}`} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{section.title}</h3>
                <p className="text-sm text-gray-600">{section.subtitle} • {section.specs}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Add Images Section */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleAddImages(e.target.files)}
                className="hidden"
                id="file-upload"
              />
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                {section.type.includes('promotion') ? 'Add Day-Scheduled Images' : 'Add Images to Carousel'}
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                {section.type.includes('promotion') 
                  ? 'Upload images that will be displayed based on your selected days. Recommended: ' 
                  : 'Upload multiple images for this carousel. Recommended: '
                }{section.specs}
                {section.type.includes('promotion') && (
                  <span className="block mt-1 text-xs text-amber-600">
                    ⚠️ Promotion banners use a very wide format (12:1 or 7.68:1 ratio)
                  </span>
                )}
                <span className="block mt-2 text-xs text-blue-600">
                  💡 Keep important content within the central 80% to avoid cropping
                </span>
              </p>
              <Button
                type="button"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Select Images
              </Button>
            </div>

            {/* Promotional Banner Day Assignment Info */}
            {section.type.includes('promotion') && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <h4 className="font-medium text-gray-900">Individual Day Assignment</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Each promotional banner will be assigned to specific days of the week. Only one banner can be shown per day.
                </p>
                <p className="text-xs text-amber-600">
                  💡 After uploading, assign each image to specific days below in the image settings.
                </p>
              </div>
            )}

            {/* Pending Images */}
            {pendingImages.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">New Images to Upload</h4>
                {pendingImages.map((image, index) => (
                  <div key={image.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-16 w-24 bg-blue-200 rounded flex items-center justify-center">
                          <Upload className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{image.file.name}</p>
                        <p className="text-sm text-gray-600">
                          {(image.file.size / 1024).toFixed(1)} KB • Order: {image.order}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePendingImage(image.id)}
                          title="Remove image"
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Day Assignment for Promotional Banners */}
                    {section.type.includes('promotion') && (
                      <div className="mt-4 p-3 bg-white border border-purple-200 rounded-lg">
                        <div className="flex items-center space-x-2 mb-3">
                          <Calendar className="h-4 w-4 text-purple-600" />
                          <h5 className="text-sm font-medium text-purple-900">Assign Days for Display:</h5>
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                            const isSelected = image.scheduleDays?.includes(day) || false
                            const isUsedByOther = getUsedDays().includes(day) && !isSelected
                            
                            return (
                              <label key={day} className={`flex flex-col items-center p-2 border rounded-lg cursor-pointer transition-colors ${
                                isSelected 
                                  ? 'bg-purple-100 border-purple-300 text-purple-900' 
                                  : isUsedByOther 
                                    ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed' 
                                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                              }`}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  disabled={isUsedByOther}
                                  onChange={(e) => {
                                    const currentDays = image.scheduleDays || []
                                    const newDays = e.target.checked 
                                      ? [...currentDays, day]
                                      : currentDays.filter(d => d !== day)
                                    updatePendingImageDays(image.id, newDays)
                                  }}
                                  className="sr-only"
                                />
                                <span className="text-xs font-medium">
                                  {day.slice(0, 3).toUpperCase()}
                                </span>
                                <span className="text-xs mt-1">
                                  {isUsedByOther && '❌'}
                                  {isSelected && '✅'}
                                </span>
                              </label>
                            )
                          })}
                        </div>
                        <div className="mt-3 text-xs text-gray-600">
                          <strong>Selected Days:</strong> {
                            image.scheduleDays && image.scheduleDays.length > 0 
                              ? image.scheduleDays.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ')
                              : 'None selected (⚠️ This image will not be displayed)'
                          }
                        </div>
                        {getUsedDays().length > 0 && (
                          <div className="mt-2 text-xs text-amber-600">
                            <strong>Days already taken:</strong> {
                              [...new Set(getUsedDays())]
                                .filter(day => !image.scheduleDays?.includes(day))
                                .map(day => day.charAt(0).toUpperCase() + day.slice(1))
                                .join(', ') || 'None'
                            }
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Existing Images */}
            {section.images.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">
                    {section.type.includes('promotion') ? 'Current Day-Scheduled Images' : 'Current Carousel Images'}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {section.type.includes('promotion') 
                      ? 'Manage day-based display settings' 
                      : 'Drag to reorder or use arrow buttons'
                    }
                  </p>
                </div>
                {section.images
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((image, index) => (
                  <div key={image.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-shrink-0">
                      <img
                        src={image.image_url || image.mobile_image_url || ''}
                        alt={`${section.title} image ${index + 1}`}
                        className="h-16 w-24 object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{image.filename || `Image ${index + 1}`}</p>
                      <p className="text-sm text-gray-600">Display Order: {image.display_order}</p>
                      <p className="text-xs text-gray-500">
                        Status: {image.is_active ? 'Active' : 'Inactive'}
                      </p>
                      {section.type.includes('promotion') && (
                        <div className="mt-2">
                          <p className="text-xs text-purple-600 mb-1">
                            <Calendar className="inline h-3 w-3 mr-1" />
                            <strong>Assigned Days:</strong> {
                              image.schedule_days && image.schedule_days.length > 0
                                ? image.schedule_days.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ')
                                : 'No days assigned'
                            }
                          </p>
                          
                          {/* Day Assignment Editor */}
                          <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded">
                            <div className="grid grid-cols-7 gap-1">
                              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                                const isSelected = image.schedule_days?.includes(day) || false
                                const isUsedByOther = getUsedDays(image.id).includes(day)
                                
                                return (
                                  <label key={day} className={`flex flex-col items-center p-1 border rounded cursor-pointer transition-colors text-xs ${
                                    isSelected 
                                      ? 'bg-purple-100 border-purple-300 text-purple-900' 
                                      : isUsedByOther 
                                        ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed' 
                                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                  }`}>
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      disabled={isUsedByOther}
                                      onChange={(e) => {
                                        const currentDays = image.schedule_days || []
                                        const newDays = e.target.checked 
                                          ? [...currentDays, day]
                                          : currentDays.filter(d => d !== day)
                                        updateExistingImageDays(image.id, newDays)
                                      }}
                                      className="sr-only"
                                    />
                                    <span className="font-medium">
                                      {day.slice(0, 2).toUpperCase()}
                                    </span>
                                    <span className="text-xs">
                                      {isUsedByOther && '❌'}
                                      {isSelected && '✅'}
                                    </span>
                                  </label>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Reorder Controls */}
                      <div className="flex flex-col space-y-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveImageUp(image.id)}
                          disabled={index === 0}
                          title="Move up"
                          className="h-6 w-6 p-0"
                        >
                          <ChevronUp className="h-3 w-3 text-gray-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveImageDown(image.id)}
                          disabled={index === section.images.length - 1}
                          title="Move down"
                          className="h-6 w-6 p-0"
                        >
                          <ChevronDown className="h-3 w-3 text-gray-500" />
                        </Button>
                      </div>
                      
                      {/* Status Toggle */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExistingImage(image.id)}
                        title={image.is_active ? 'Disable image' : 'Enable image'}
                      >
                        {image.is_active ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                      
                      {/* Delete */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteExistingImage(image.id)}
                        title="Delete image"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {section.images.length === 0 && pendingImages.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <h4 className="font-medium text-gray-900 mb-1">No images yet</h4>
                <p className="text-sm">Add your first image to this carousel above</p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
            <Button variant="secondary" onClick={onClose} disabled={saving}>
              {pendingImages.length > 0 ? 'Cancel' : 'Close'}
            </Button>
            {pendingImages.length > 0 && (
              <Button onClick={handleSaveCarousel} disabled={saving}>
                {saving ? 'Uploading...' : `Upload ${pendingImages.length} Images`}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BannersPage() {
  const [bannerImages, setBannerImages] = useState<BannerImage[]>([])
  const [loading, setLoading] = useState(true)
  const [showSpecs, setShowSpecs] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchBannerImages()
  }, [])

  const fetchBannerImages = async () => {
    try {
      const { data, error } = await supabase
        .from('banner_images')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) {
        console.error('Error fetching banner images:', {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        setBannerImages([])
      } else {
        setBannerImages(data || [])
      }
    } catch (error) {
      console.error('Error fetching banner images:', error)
      setBannerImages([])
    } finally {
      setLoading(false)
    }
  }





  // Organize images by section
  const bannerSections: BannerSection[] = [
    {
      type: 'main-web',
      title: 'Main Banner - Web',
      subtitle: 'Desktop hero carousel',
      specs: '1200x225px',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      icon: Monitor,
      images: bannerImages.filter(img => img.banner_id === 'main-web')
    },
    {
      type: 'main-mobile',
      title: 'Main Banner - Mobile',
      subtitle: 'Mobile hero carousel',
      specs: '800x150px',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200',
      icon: Smartphone,
      images: bannerImages.filter(img => img.banner_id === 'main-mobile')
    },
    {
      type: 'promotion-web',
      title: 'Promotions Banner - Web',
      subtitle: 'Desktop promotions carousel',
      specs: '1200x100px',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-200',
      icon: Monitor,
      images: bannerImages.filter(img => img.banner_id === 'promotion-web')
    },
    {
      type: 'promotion-mobile',
      title: 'Promotions Banner - Mobile',
      subtitle: 'Mobile promotions carousel',
      specs: '768x100px',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-200',
      icon: Smartphone,
      images: bannerImages.filter(img => img.banner_id === 'promotion-mobile')
    }
  ]

  const activeSection = bannerSections.find(section => section.type === activeModal)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Banner Management</h1>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Banner Management</h1>
          <p className="text-gray-600 mt-1">
            Manage carousel images for each banner type and device. Click on a banner type to manage its images.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => setShowSpecs(!showSpecs)}
        >
          <Info className="h-4 w-4 mr-2" />
          Image Specs
        </Button>
      </div>



      {/* Image Specifications */}
      {showSpecs && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-900">Image Specifications</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowSpecs(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>📏 Updated:</strong> Banner specifications have been standardized to match the actual frontend display. 
              Main banners are 225px height, promotions are 100px height.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-gray-900">Desktop Banners</h4>
              </div>
              <div className="space-y-2 text-sm">
                <p><strong>Main Hero:</strong> 1200x225px (5.33:1 ratio)</p>
                <p><strong>Promotion:</strong> 1200x100px (12:1 ratio)</p>
                <p><strong>File Size:</strong> Max 500KB</p>
                <p><strong>Format:</strong> WebP (preferred) or JPEG</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-gray-900">Mobile Banners</h4>
              </div>
              <div className="space-y-2 text-sm">
                <p><strong>Main Hero:</strong> 800x150px (5.33:1 ratio)</p>
                <p><strong>Promotion:</strong> 768x100px (7.68:1 ratio)</p>
                <p><strong>File Size:</strong> Max 200KB</p>
                <p><strong>Format:</strong> WebP (preferred) or JPEG</p>
              </div>
            </div>
          </div>
          
          {/* Design Guidelines */}
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
              🎨 Design Guidelines
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <div>
                  <h5 className="font-medium text-green-800">Safe Zone Content</h5>
                  <p className="text-green-700">Keep important text and logos within the central 80% of the banner to avoid cropping on different screen sizes.</p>
                </div>
                <div>
                  <h5 className="font-medium text-green-800">Text Readability</h5>
                  <p className="text-green-700">Use high contrast colors and fonts 16px+ for readability. Avoid placing text over busy background areas.</p>
                </div>
                <div>
                  <h5 className="font-medium text-green-800">Call-to-Action</h5>
                  <p className="text-green-700">Place primary CTAs in the right third of the banner. Use contrasting colors to make buttons stand out.</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <h5 className="font-medium text-green-800">Brand Consistency</h5>
                  <p className="text-green-700">Maintain consistent brand colors, fonts, and logo placement across all banners.</p>
                </div>
                <div>
                  <h5 className="font-medium text-green-800">Mobile Optimization</h5>
                  <p className="text-green-700">Ensure text is readable and CTAs are easily tappable on mobile devices. Test on various screen sizes.</p>
                </div>
                <div>
                  <h5 className="font-medium text-green-800">Loading Performance</h5>
                  <p className="text-green-700">Optimize images for web. Use WebP format when possible. Keep file sizes under the recommended limits.</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Banner Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bannerSections.map(section => (
          <Card 
            key={section.type} 
            className={`cursor-pointer transition-all hover:shadow-lg border-2 ${section.borderColor} ${section.bgColor}`}
            onClick={() => setActiveModal(section.type)}
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${section.bgColor} border ${section.borderColor}`}>
                    <section.icon className={`h-8 w-8 ${section.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                    <p className="text-sm text-gray-600">{section.subtitle}</p>
                    <p className="text-xs text-gray-500 mt-1">{section.specs}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${section.iconColor}`}>
                    {section.images.length}
                  </div>
                  <p className="text-xs text-gray-500">images</p>
                  <ChevronRight className="h-5 w-5 text-gray-400 mt-2" />
                </div>
              </div>
              
              {/* Weekly Schedule for Promotional Banners */}
              {section.type.includes('promotion') && (
                <div className="mt-4 p-3 bg-white border border-purple-200 rounded-lg">
                  <h4 className="text-sm font-medium text-purple-900 mb-3 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Weekly Schedule
                  </h4>
                  <div className="grid grid-cols-7 gap-1">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                      const dayImage = section.images.find(img => img.schedule_days?.includes(day))
                      const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() === day
                      
                      return (
                        <div key={day} className={`p-2 border rounded text-center ${
                          isToday 
                            ? 'border-purple-500 bg-purple-100' 
                            : dayImage 
                              ? 'border-green-300 bg-green-50' 
                              : 'border-gray-200 bg-gray-50'
                        }`}>
                          <div className="text-xs font-medium text-gray-700 mb-1">
                            {day.slice(0, 3).toUpperCase()}
                            {isToday && <span className="ml-1 text-purple-600">•</span>}
                          </div>
                          <div className="text-xs">
                            {dayImage ? (
                              <div className="space-y-1">
                                <div className="w-full h-4 bg-gray-200 rounded overflow-hidden">
                                  <img 
                                    src={dayImage.image_url || dayImage.mobile_image_url || ''} 
                                    alt={day} 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="text-xs text-green-600">✓</div>
                              </div>
                            ) : (
                              <div className="text-gray-400 py-1">—</div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    <span className="inline-flex items-center mr-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-1"></div>
                      Today
                    </span>
                    <span className="inline-flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                      Has banner
                    </span>
                  </div>
                </div>
              )}
              
              {/* Preview Images for Non-Promotional Banners */}
              {!section.type.includes('promotion') && section.images.length > 0 && (
                <div className="mt-4 flex space-x-2 overflow-x-auto">
                  {section.images.slice(0, 3).map(image => (
                    <img
                      key={image.id}
                      src={image.image_url || image.mobile_image_url || ''}
                      alt="Banner preview"
                      className="h-12 w-20 object-cover rounded flex-shrink-0"
                    />
                  ))}
                  {section.images.length > 3 && (
                    <div className="h-12 w-20 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-gray-500">+{section.images.length - 3}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Banner Carousel Modal */}
      {activeSection && (
        <BannerCarouselModal
          section={activeSection}
          isOpen={activeModal !== null}
          onClose={() => setActiveModal(null)}
          onSave={fetchBannerImages}
        />
      )}
    </div>
  )
} 