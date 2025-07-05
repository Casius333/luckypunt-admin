import { ComingSoon } from '@/components/ui/coming-soon'
import { Users } from 'lucide-react'

export default function PlayerSegmentationPage() {
  return (
    <ComingSoon 
      title="Player Segmentation"
      description="Advanced player categorization, behavioral analysis, VIP tier management, and targeted marketing segments."
      icon={<Users className="h-8 w-8 text-blue-600" />}
    />
  )
} 