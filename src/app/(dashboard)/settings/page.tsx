'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'

const defaultPolicies = [
  { id: 'send_email', label: 'Send emails', autoApprove: false },
  { id: 'create_event', label: 'Create calendar events', autoApprove: false },
  { id: 'read_email', label: 'Read emails', autoApprove: true },
  { id: 'list_events', label: 'List calendar events', autoApprove: true },
]

export default function SettingsPage() {
  const [agentName, setAgentName] = useState('My Executive Assistant')
  const [instructions, setInstructions] = useState(
    'You are my professional executive assistant. Always be concise, prioritize urgent items, and ask before sending anything on my behalf.'
  )
  const [policies, setPolicies] = useState(defaultPolicies)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    // In production this would call PATCH /api/agents/:id
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function togglePolicy(id: string) {
    setPolicies((prev) =>
      prev.map((p) => (p.id === id ? { ...p, autoApprove: !p.autoApprove } : p))
    )
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Customize your agent and approval rules.</p>
      </div>

      {/* Agent details */}
      <Card>
        <CardHeader>
          <CardTitle>Agent details</CardTitle>
          <CardDescription>Name your agent and give it instructions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="agent-name">Agent name</Label>
            <Input
              id="agent-name"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="My Executive Assistant"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <textarea
              id="instructions"
              className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Give your agent a personality and rules to follow…"
            />
            <p className="text-xs text-muted-foreground">
              Be specific about tone, priorities, and what needs your approval.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
            {saved && <span className="text-sm text-green-600 font-medium">Saved ✓</span>}
          </div>
        </CardContent>
      </Card>

      {/* Approval policies */}
      <Card>
        <CardHeader>
          <CardTitle>Approval policies</CardTitle>
          <CardDescription>
            Toggle auto-approval for specific actions. When off, your agent will ask you first.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {policies.map((policy) => (
              <li key={policy.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{policy.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {policy.autoApprove ? 'Auto-approved' : 'Always asks for approval'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={policy.autoApprove ? 'success' : 'secondary'}>
                    {policy.autoApprove ? 'Auto' : 'Ask'}
                  </Badge>
                  <Switch
                    checked={policy.autoApprove}
                    onCheckedChange={() => togglePolicy(policy.id)}
                  />
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>
            Irreversible actions. These cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="text-sm font-medium">Disconnect Gmail</p>
              <p className="text-xs text-muted-foreground">
                Your agent will lose access to your inbox.
              </p>
            </div>
            <Button variant="outline" size="sm">
              Disconnect
            </Button>
          </div>
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="text-sm font-medium">Disconnect Google Calendar</p>
              <p className="text-xs text-muted-foreground">
                Your agent will lose access to your calendar.
              </p>
            </div>
            <Button variant="outline" size="sm">
              Disconnect
            </Button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-destructive">Delete agent</p>
              <p className="text-xs text-muted-foreground">
                Permanently delete your agent and all its data.
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Delete agent
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
