'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ArrowUpDown, 
  AlertTriangle,
  Eye,
  Activity,
  Target,
  Info,
  Zap
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'

// Mock data for the dashboard
const generateMockData = () => {
  const today = new Date()
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    return {
      date: date.toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 50000) + 20000,
      deposits: Math.floor(Math.random() * 30000) + 15000,
      withdrawals: Math.floor(Math.random() * 20000) + 10000,
      activeUsers: Math.floor(Math.random() * 500) + 200,
      newSignups: Math.floor(Math.random() * 50) + 10
    }
  }).reverse()

  return {
    kpis: {
      totalPlayers: 12450,
      totalPlayersChange: 5.2,
      activePlayers: 3240,
      activePlayersChange: 12.5,
      livePlayers: 847,
      livePlayersChange: 8.7,
      revenue: 145680,
      revenueChange: 8.3,
      netProfit: 98450,
      netProfitChange: 15.2,
      totalDeposits: 234500,
      depositsChange: 6.8,
      totalWithdrawals: 189200,
      withdrawalsChange: 4.2,
      pendingWithdrawals: 45300,
      pendingWithdrawalsChange: -2.1
    },
    chartData: last7Days
  }
}

interface TimePeriod {
  value: string
  label: string
}

const timePeriods: TimePeriod[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7days', label: 'Last 7 Days' },
  { value: '30days', label: 'This Month' },
  { value: 'custom', label: 'Custom Range' }
]

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('7days')
  const [mockData, setMockData] = useState(generateMockData())
  const [isLoading, setIsLoading] = useState(false)
  const [expandedTooltip, setExpandedTooltip] = useState<string | null>(null)

  // Simulate data refresh when period changes
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setMockData(generateMockData())
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [selectedPeriod])

  const InfoTooltip = ({ id, tooltip }: { id: string; tooltip: string }) => (
    <div className="relative">
      <button
        onClick={() => setExpandedTooltip(expandedTooltip === id ? null : id)}
        className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <Info className="h-4 w-4" />
      </button>
      {expandedTooltip === id && (
        <>
          {/* Backdrop to close tooltip when clicking outside */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setExpandedTooltip(null)}
          />
          <div className="absolute z-50 left-1/2 transform -translate-x-1/2 bottom-full mb-2 w-64 bg-gray-900 text-white text-sm rounded-lg p-3 shadow-xl border border-gray-700">
            {tooltip}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 border-r border-b border-gray-700"></div>
          </div>
        </>
      )}
    </div>
  )



  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <div className="flex items-center gap-4">
          <Select 
            value={selectedPeriod} 
            onValueChange={setSelectedPeriod}
            options={timePeriods}
            className="w-48"
          />
          <Button variant="secondary" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Live View
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Overview */}
        <div className="lg:col-span-2">
          <Card className="p-6 h-full">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Financial Overview</h3>
              <p className="text-sm text-gray-500 mt-1">All figures compared to previous period</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                             {/* Revenue Metrics */}
               <div className="space-y-4">
                 <div>
                   <div className="flex items-center justify-between">
                     <div className="flex-1">
                       <div className="flex items-center">
                         <p className="text-sm font-medium text-gray-600">Revenue (GGR)</p>
                         <InfoTooltip 
                           id="revenue" 
                           tooltip="Gross Gaming Revenue - Total bets minus total payouts to players" 
                         />
                       </div>
                       <p className="text-xl font-bold text-gray-900">${mockData.kpis.revenue.toLocaleString()}</p>
                     </div>
                     <div className="flex items-center ml-3">
                       {mockData.kpis.revenueChange >= 0 ? (
                         <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                       ) : (
                         <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                       )}
                       <span className={`text-sm font-medium ${mockData.kpis.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                         {Math.abs(mockData.kpis.revenueChange)}%
                       </span>
                     </div>
                   </div>
                 </div>
                 <div>
                   <div className="flex items-center justify-between">
                     <div className="flex-1">
                       <div className="flex items-center">
                         <p className="text-sm font-medium text-gray-600">Net Profit</p>
                         <InfoTooltip 
                           id="profit" 
                           tooltip="Net Profit - Revenue minus operational costs, bonuses, and fees" 
                         />
                       </div>
                       <p className="text-xl font-bold text-gray-900">${mockData.kpis.netProfit.toLocaleString()}</p>
                     </div>
                     <div className="flex items-center ml-3">
                       {mockData.kpis.netProfitChange >= 0 ? (
                         <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                       ) : (
                         <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                       )}
                       <span className={`text-sm font-medium ${mockData.kpis.netProfitChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                         {Math.abs(mockData.kpis.netProfitChange)}%
                       </span>
                     </div>
                   </div>
                 </div>
               </div>

                             {/* Deposit & Withdrawal Metrics */}
               <div className="space-y-4">
                 <div>
                   <div className="flex items-center justify-between">
                     <div className="flex-1">
                       <div className="flex items-center">
                         <p className="text-sm font-medium text-gray-600">Total Deposits</p>
                         <InfoTooltip 
                           id="deposits" 
                           tooltip="Total amount deposited by players in selected period" 
                         />
                       </div>
                       <p className="text-xl font-bold text-gray-900">${mockData.kpis.totalDeposits.toLocaleString()}</p>
                     </div>
                     <div className="flex items-center ml-3">
                       {mockData.kpis.depositsChange >= 0 ? (
                         <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                       ) : (
                         <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                       )}
                       <span className={`text-sm font-medium ${mockData.kpis.depositsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                         {Math.abs(mockData.kpis.depositsChange)}%
                       </span>
                     </div>
                   </div>
                 </div>
                 <div>
                   <div className="flex items-center justify-between">
                     <div className="flex-1">
                       <div className="flex items-center">
                         <p className="text-sm font-medium text-gray-600">Total Withdrawals</p>
                         <InfoTooltip 
                           id="withdrawals" 
                           tooltip="Total amount withdrawn by players in selected period" 
                         />
                       </div>
                       <p className="text-xl font-bold text-gray-900">${mockData.kpis.totalWithdrawals.toLocaleString()}</p>
                     </div>
                     <div className="flex items-center ml-3">
                       {mockData.kpis.withdrawalsChange >= 0 ? (
                         <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                       ) : (
                         <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                       )}
                       <span className={`text-sm font-medium ${mockData.kpis.withdrawalsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                         {Math.abs(mockData.kpis.withdrawalsChange)}%
                       </span>
                     </div>
                   </div>
                 </div>
               </div>

                             {/* Pending & Net Flow */}
               <div className="space-y-4">
                 <div>
                   <div className="flex items-center justify-between">
                     <div className="flex-1">
                       <div className="flex items-center">
                         <p className="text-sm font-medium text-gray-600">Pending Withdrawals</p>
                         <InfoTooltip 
                           id="pending" 
                           tooltip="Total withdrawal requests awaiting approval and processing" 
                         />
                       </div>
                       <p className="text-xl font-bold text-gray-900">${mockData.kpis.pendingWithdrawals.toLocaleString()}</p>
                     </div>
                     <div className="flex items-center ml-3">
                       {mockData.kpis.pendingWithdrawalsChange >= 0 ? (
                         <TrendingUp className="h-4 w-4 text-red-600 mr-1" />
                       ) : (
                         <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
                       )}
                       <span className={`text-sm font-medium ${mockData.kpis.pendingWithdrawalsChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                         {Math.abs(mockData.kpis.pendingWithdrawalsChange)}%
                       </span>
                     </div>
                   </div>
                 </div>
                 <div>
                   <div className="flex items-center justify-between">
                     <div className="flex-1">
                       <div className="flex items-center">
                         <p className="text-sm font-medium text-gray-600">Net Cash Flow</p>
                         <InfoTooltip 
                           id="cashflow" 
                           tooltip="Net cash flow - Deposits minus withdrawals in selected period" 
                         />
                       </div>
                       <p className="text-xl font-bold text-gray-900">
                         ${(mockData.kpis.totalDeposits - mockData.kpis.totalWithdrawals).toLocaleString()}
                       </p>
                     </div>
                     <div className="flex items-center ml-3">
                       <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                       <span className="text-sm font-medium text-green-600">
                         {((mockData.kpis.depositsChange + mockData.kpis.withdrawalsChange) / 2).toFixed(1)}%
                       </span>
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          </Card>
        </div>

        {/* Player Metrics */}
        <div>
          <Card className="p-6 h-full">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Player Overview</h3>
              <p className="text-sm text-gray-500 mt-1">All figures compared to previous period</p>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-600">Total Players</p>
                      <InfoTooltip 
                        id="totalplayers" 
                        tooltip="Total number of registered players on the platform" 
                      />
                    </div>
                    <p className="text-xl font-bold text-gray-900">{mockData.kpis.totalPlayers.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center ml-3">
                    {mockData.kpis.totalPlayersChange >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${mockData.kpis.totalPlayersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(mockData.kpis.totalPlayersChange)}%
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-600">Active Players</p>
                      <InfoTooltip 
                        id="activeplayers" 
                        tooltip="Players who have logged in, played, or deposited in the selected period" 
                      />
                    </div>
                    <p className="text-xl font-bold text-gray-900">{mockData.kpis.activePlayers.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center ml-3">
                    {mockData.kpis.activePlayersChange >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${mockData.kpis.activePlayersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(mockData.kpis.activePlayersChange)}%
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-600">Live Players</p>
                      <InfoTooltip 
                        id="liveplayers" 
                        tooltip="Players currently online and actively playing right now" 
                      />
                    </div>
                    <p className="text-xl font-bold text-gray-900">{mockData.kpis.livePlayers.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center ml-3">
                    <Zap className="h-4 w-4 text-blue-600 mr-1" />
                    <span className="text-sm font-medium text-blue-600">
                      Live
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Over Time */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mockData.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Deposits vs Withdrawals */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Deposits vs Withdrawals</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockData.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`]} />
              <Bar dataKey="deposits" fill="#82ca9d" name="Deposits" />
              <Bar dataKey="withdrawals" fill="#ffc658" name="Withdrawals" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Player Activity */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Player Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockData.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="activeUsers" stroke="#8884d8" name="Active Users" />
              <Line type="monotone" dataKey="newSignups" stroke="#82ca9d" name="New Signups" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>



      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <Button variant="secondary" className="h-16 flex flex-col items-center justify-center">
             <AlertTriangle className="h-5 w-5 mb-1" />
             <span className="text-sm">Review Flags</span>
           </Button>
           <Button variant="secondary" className="h-16 flex flex-col items-center justify-center">
             <ArrowUpDown className="h-5 w-5 mb-1" />
             <span className="text-sm">Approve Withdrawals</span>
           </Button>
           <Button variant="secondary" className="h-16 flex flex-col items-center justify-center">
             <Users className="h-5 w-5 mb-1" />
             <span className="text-sm">Manage Players</span>
           </Button>
           <Button variant="secondary" className="h-16 flex flex-col items-center justify-center">
             <Target className="h-5 w-5 mb-1" />
             <span className="text-sm">Run Reports</span>
           </Button>
         </div>
      </Card>
    </div>
  )
} 