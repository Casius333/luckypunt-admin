import { ComingSoon } from '@/components/ui/coming-soon'
import { Image } from 'lucide-react'

export default function BannersPage() {
  return (
    <ComingSoon 
      title="Banner Management"
      description="Create, edit, and manage promotional banners, hero images, and advertising content displayed across your casino website."
      icon={<Image className="h-8 w-8 text-blue-600" />}
    />
  )
} 