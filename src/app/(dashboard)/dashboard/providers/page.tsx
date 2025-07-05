import { ComingSoon } from '@/components/ui/coming-soon'
import { Boxes } from 'lucide-react'

export default function ProvidersPage() {
  return (
    <ComingSoon 
      title="Provider Limits"
      description="Gaming provider limits management, API integrations, and third-party service configurations."
      icon={<Boxes className="h-8 w-8 text-blue-600" />}
    />
  )
} 