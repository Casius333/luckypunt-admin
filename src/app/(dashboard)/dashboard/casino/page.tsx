import { ComingSoon } from '@/components/ui/coming-soon'
import { Gamepad2 } from 'lucide-react'

export default function CasinoPage() {
  return (
    <ComingSoon 
      title="Casino Management"
      description="Casino games management, game configuration, RTP settings, and gaming provider integrations."
      icon={<Gamepad2 className="h-8 w-8 text-blue-600" />}
    />
  )
} 