import { ComingSoon } from '@/components/ui/coming-soon'
import { FileText } from 'lucide-react'

export default function ReportsPage() {
  return (
    <ComingSoon 
      title="Reports"
      description="Analytics and reporting dashboard for tracking performance, revenue, player behavior, and business insights."
      icon={<FileText className="h-8 w-8 text-blue-600" />}
    />
  )
} 