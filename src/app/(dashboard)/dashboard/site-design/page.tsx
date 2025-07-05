import { ComingSoon } from '@/components/ui/coming-soon'
import { Palette } from 'lucide-react'

export default function SiteDesignPage() {
  return (
    <ComingSoon 
      title="Site Design"
      description="Website design management, theme customization, banner management, and visual branding control for your casino platform."
      icon={<Palette className="h-8 w-8 text-blue-600" />}
    />
  )
} 