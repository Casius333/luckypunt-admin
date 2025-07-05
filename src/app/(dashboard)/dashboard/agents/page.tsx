import { ComingSoon } from '@/components/ui/coming-soon'
import { Users } from 'lucide-react'

export default function AgentsPage() {
  return (
    <ComingSoon 
      title="Agent System"
      description="Agent management, hierarchical structures, commission tracking, and agent performance analytics."
      icon={<Users className="h-8 w-8 text-blue-600" />}
    />
  )
} 