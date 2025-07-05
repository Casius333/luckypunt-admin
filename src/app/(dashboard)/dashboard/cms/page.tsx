import { ComingSoon } from '@/components/ui/coming-soon'
import { FileText } from 'lucide-react'

export default function CMSPage() {
  return (
    <ComingSoon 
      title="Content Management System"
      description="Website content management, page editing, banner management, and promotional content control."
      icon={<FileText className="h-8 w-8 text-blue-600" />}
    />
  )
} 