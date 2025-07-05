'use client'

import { Card } from '@/components/ui/card'
import { Clock, Settings, Wrench } from 'lucide-react'

interface ComingSoonProps {
  title: string
  description?: string
  icon?: React.ReactNode
}

export function ComingSoon({ 
  title, 
  description = "This feature is currently under development and will be available soon.",
  icon 
}: ComingSoonProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        {icon || <Settings className="h-8 w-8 text-blue-600" />}
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      </div>
      
      <Card className="p-12">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 mb-6">
            <Clock className="h-10 w-10 text-blue-600" />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Coming Soon
          </h2>
          
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {description}
          </p>
          
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-700">
            <Wrench className="h-4 w-4" />
            <span>Under Development</span>
          </div>
        </div>
      </Card>
    </div>
  )
} 