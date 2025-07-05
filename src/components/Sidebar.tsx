'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Users,
  BadgeCheck,
  Gamepad2,
  Boxes,
  Settings,
  BarChart3,
  Building2,
  MessageSquare,
  TicketCheck,
  LogOut,
  Palette,
  Image,
  Gift
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
  { 
    name: 'Players',
    href: '/dashboard/players',
    icon: Users,
    children: [
      { name: 'List', href: '/dashboard/players' },
      { name: 'Segmentation', href: '/dashboard/players/segmentation' },
      { name: 'Verification', href: '/dashboard/players/verification' },
    ]
  },
  { name: 'Casino', href: '/dashboard/casino', icon: Gamepad2 },
  { name: 'Providers Limits', href: '/dashboard/providers', icon: Boxes },
  { name: 'Sport', href: '/dashboard/sport', icon: BarChart3 },
  { name: 'Transactions', href: '/dashboard/transactions', icon: CreditCard },
  { name: 'Affiliate System', href: '/dashboard/affiliates', icon: Building2 },
  { name: 'Agent System', href: '/dashboard/agents', icon: Users },
  { name: 'Marketing', href: '/dashboard/marketing', icon: BarChart3 },
  { 
    name: 'Site Design',
    href: '/dashboard/site-design',
    icon: Palette,
    children: [
      { name: 'Banners', href: '/dashboard/site-design/banners' },
    ]
  },
  { name: 'Promotions', href: '/dashboard/promotions', icon: Gift },
  { name: 'Platform Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'CMS', href: '/dashboard/cms', icon: FileText },
  { name: 'Tickets', href: '/dashboard/tickets', icon: MessageSquare },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.replace('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <div className="flex h-full w-64 flex-col bg-[#1e2933]">
      <div className="flex h-16 items-center px-4">
        <h2 className="text-lg font-semibold text-white">LuckyPunt Admin</h2>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <div key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  isActive
                    ? 'bg-[#2a3947] text-white'
                    : 'text-gray-300 hover:bg-[#2a3947] hover:text-white',
                  'group flex items-center rounded-md px-2 py-2 text-sm font-medium'
                )}
              >
                {Icon && <Icon className="mr-3 h-5 w-5" />}
                {item.name}
              </Link>
              {item.children && isActive && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      href={child.href}
                      className={cn(
                        pathname === child.href
                          ? 'bg-[#2a3947] text-white'
                          : 'text-gray-300 hover:bg-[#2a3947] hover:text-white',
                        'block rounded-md py-2 px-3 text-sm font-medium'
                      )}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <Button
          variant="ghost"
          className="w-full text-gray-300 hover:text-white hover:bg-[#2a3947] flex items-center justify-center"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  )
} 