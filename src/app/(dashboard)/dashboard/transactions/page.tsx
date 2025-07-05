import { ComingSoon } from '@/components/ui/coming-soon'
import { ArrowLeftRight } from 'lucide-react'

export default function TransactionsPage() {
  return (
    <ComingSoon 
      title="Transactions"
      description="Transaction history, deposit and withdrawal management, payment processing and financial records."
      icon={<ArrowLeftRight className="h-8 w-8 text-blue-600" />}
    />
  )
} 