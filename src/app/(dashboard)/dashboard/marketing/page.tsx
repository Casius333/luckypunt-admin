import { ComingSoon } from '@/components/ui/coming-soon'
import { BarChart3 } from 'lucide-react'

export default function MarketingPage() {
  return (
    <ComingSoon 
      title="Marketing"
      description="Marketing campaigns, promotions, bonuses, email marketing, and customer acquisition tools."
      icon={<BarChart3 className="h-8 w-8 text-blue-600" />}
    />
  )
} 