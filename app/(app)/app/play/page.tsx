import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCouple } from '@/lib/actions/couples'
import { PartnerLink } from '@/components/play/partner-link'
import { PlayRoom } from '@/components/play/play-room'
import { CoupleMilestones } from '@/components/play/couple-milestones'

export default async function PlayPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const couple = await getCouple()

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold">Play Together</h1>
        <p className="text-muted-foreground mt-1">
          Blind Double-Pick — you each choose privately, then reveal your match.
        </p>
      </div>

      <PartnerLink initialCouple={couple} />

      {couple?.isActive && <CoupleMilestones />}
      {couple?.isActive && <PlayRoom partnerName={couple.partnerName} />}
    </div>
  )
}
