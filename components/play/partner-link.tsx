'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Heart, Copy, Check, Loader2, UserPlus, Link2Off } from 'lucide-react'
import { toast } from 'sonner'
import {
  createCoupleInvite,
  acceptCoupleInvite,
  unlinkCouple,
  type CoupleInfo,
} from '@/lib/actions/couples'

export function PartnerLink({ initialCouple }: { initialCouple: CoupleInfo | null }) {
  const [couple, setCouple] = useState<CoupleInfo | null>(initialCouple)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleCreate() {
    setBusy(true)
    const res = await createCoupleInvite()
    setBusy(false)
    if (res.error) return toast.error(res.error)
    if (res.inviteCode) {
      setCouple({
        id: '', status: 'pending', inviteCode: res.inviteCode,
        role: 'owner', partnerId: null, partnerName: null, isActive: false,
      })
      toast.success('Invite created — share the code with your partner!')
    }
  }

  async function handleAccept() {
    setBusy(true)
    const res = await acceptCoupleInvite(code)
    setBusy(false)
    if (!res.success) return toast.error(res.error ?? 'Could not join.')
    toast.success("You're linked! Time to play.")
    // Reflect linked state; the page will refresh server data on next navigation.
    setCouple({
      id: '', status: 'active', inviteCode: '',
      role: 'partner', partnerId: null, partnerName: null, isActive: true,
    })
  }

  async function handleUnlink() {
    setBusy(true)
    const res = await unlinkCouple()
    setBusy(false)
    if (!res.success) return toast.error(res.error ?? 'Could not unlink.')
    setCouple(null)
    toast.success('Unlinked.')
  }

  function copyCode() {
    if (!couple?.inviteCode) return
    navigator.clipboard.writeText(couple.inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  // Active couple
  if (couple?.isActive) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shadow-playful">
              <Heart className="w-5 h-5 text-white fill-current" />
            </div>
            <div>
              <p className="font-semibold">Linked with {couple.partnerName ?? 'your partner'}</p>
              <p className="text-sm text-muted-foreground">You can play together now.</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleUnlink} disabled={busy} className="text-muted-foreground">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2Off className="w-4 h-4" />}
            <span className="ml-2 hidden sm:inline">Unlink</span>
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Pending invite created by this user
  if (couple?.status === 'pending' && couple.role === 'owner') {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full">Waiting</Badge>
            Share your invite code
          </CardTitle>
          <CardDescription>
            Send this code to your partner. Once they enter it, you can play together.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 text-center text-2xl font-bold tracking-[0.3em] py-3 rounded-xl bg-muted">
              {couple.inviteCode}
            </div>
            <Button variant="outline" size="icon" onClick={copyCode} className="rounded-xl h-12 w-12" aria-label="Copy code">
              {copied ? <Check className="w-5 h-5 text-success" /> : <Copy className="w-5 h-5" />}
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={handleUnlink} disabled={busy} className="text-muted-foreground">
            Cancel invite
          </Button>
        </CardContent>
      </Card>
    )
  }

  // No couple yet
  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary" />
          Link with your partner
        </CardTitle>
        <CardDescription>
          Playing together unlocks Blind Double-Pick — you each pick privately and the app reveals your match.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleCreate} disabled={busy} className="w-full gradient-primary text-white rounded-xl h-12">
          {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Heart className="w-4 h-4 mr-2" />}
          Create an invite code
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or join your partner</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter code"
            maxLength={6}
            className="rounded-xl text-center tracking-[0.2em] font-semibold uppercase"
            aria-label="Partner invite code"
          />
          <Button onClick={handleAccept} disabled={busy || code.trim().length < 4} className="rounded-xl h-10">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Join'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
