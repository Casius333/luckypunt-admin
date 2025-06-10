'use client'

import { useState } from 'react'
import { Settings, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PlayersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCreation, setSelectedCreation] = useState('all')

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">List</h1>
        <Button className="bg-green-600 hover:bg-green-700">
          Create Player
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <select
          value={selectedCreation}
          onChange={(e) => setSelectedCreation(e.target.value)}
          className="h-10 w-48 rounded-md border bg-white px-3 py-2 text-sm"
        >
          <option value="all">Select User Creation</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="last7days">Last 7 Days</option>
        </select>

        <div className="flex gap-2">
          <Button variant="secondary">
            <Settings className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="primary" className="bg-blue-600 hover:bg-blue-700">
            Apply
          </Button>
        </div>

        <div className="flex-1">
          <input
            type="text"
            placeholder="Search Player ID, Player Name, Email, Personal number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 w-full rounded-md border bg-white px-3 py-2 text-sm"
          />
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" className="border border-gray-300">
            <Settings className="h-4 w-4 mr-2" />
            Columns Settings
          </Button>
          <Button variant="secondary" className="border border-gray-300">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Personal number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  First Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Segments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deposit Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bonus
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Currency
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Table rows will be populated with data */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 