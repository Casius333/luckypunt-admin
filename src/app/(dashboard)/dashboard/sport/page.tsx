'use client'

import { Card } from '@/components/ui/card'

export default function SportPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Sport Management</h1>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Active Events</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Bets</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Volume</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">$0.00</p>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-medium">Recent Events</h2>
          <div className="mt-6 flow-root">
            <div className="-my-5 divide-y divide-gray-200">
              <div className="py-5">
                <p className="text-sm text-gray-500">No events found</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
} 