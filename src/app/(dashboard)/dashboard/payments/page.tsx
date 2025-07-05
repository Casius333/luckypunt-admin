import { ComingSoon } from '@/components/ui/coming-soon'
import { CreditCard } from 'lucide-react'

export default function PaymentsPage() {
  return (
    <ComingSoon 
      title="Payments"
      description="Payment gateway management, transaction processing, deposit and withdrawal handling for the casino platform."
      icon={<CreditCard className="h-8 w-8 text-blue-600" />}
    />
  )
} 