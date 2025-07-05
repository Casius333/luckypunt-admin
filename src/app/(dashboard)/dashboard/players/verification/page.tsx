import { ComingSoon } from '@/components/ui/coming-soon'
import { BadgeCheck } from 'lucide-react'

export default function PlayerVerificationPage() {
  return (
    <ComingSoon 
      title="Player Verification"
      description="KYC (Know Your Customer) verification, document review, identity validation, and compliance management."
      icon={<BadgeCheck className="h-8 w-8 text-blue-600" />}
    />
  )
} 