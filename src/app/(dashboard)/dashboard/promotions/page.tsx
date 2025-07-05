import { ComingSoon } from '@/components/ui/coming-soon'
import { Gift } from 'lucide-react'

export default function PromotionsPage() {
  return (
    <ComingSoon 
      title="Promotions"
      description="Manage promotional campaigns, bonuses, special offers, welcome packages, and loyalty rewards for your casino players."
      icon={<Gift className="h-8 w-8 text-blue-600" />}
    />
  )
} 