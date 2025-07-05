import { ComingSoon } from '@/components/ui/coming-soon'
import { MessageSquare } from 'lucide-react'

export default function TicketsPage() {
  return (
    <ComingSoon 
      title="Support Tickets"
      description="Customer support ticket management, help desk system, and player issue tracking."
      icon={<MessageSquare className="h-8 w-8 text-blue-600" />}
    />
  )
} 