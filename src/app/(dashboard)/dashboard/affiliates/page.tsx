import { ComingSoon } from '@/components/ui/coming-soon'
import { Building2 } from 'lucide-react'

export default function AffiliatesPage() {
  return (
    <ComingSoon 
      title="Affiliate System"
      description="Affiliate program management, partner tracking, commission structures, and referral analytics."
      icon={<Building2 className="h-8 w-8 text-blue-600" />}
    />
  )
} 