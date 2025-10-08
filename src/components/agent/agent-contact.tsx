'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import {
  Mail,
  Phone,
  Building2,
  Edit2
} from 'lucide-react'

import { Agent } from '../../types'

interface AgentContactProps {
  agent: Agent
}

export function AgentContact({ agent }: AgentContactProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState({
    email: agent.email || '',
    phone: agent.phone || '',
    title: agent.title || '',
    company: agent.company || '',
    division: agent.division || '',
    costCenter: agent.costCenter || '',
  })

  const handleSaveContact = async () => {
    try {
      // In a real implementation, this would call an API to update the agent
      console.log('Updating agent:', {
        agentId: agent.id,
        ...editingContact
      })
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error('Failed to update agent:', error)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Contact Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Information
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => {
              setEditingContact({
                email: agent.email || '',
                phone: agent.phone || '',
                title: agent.title || '',
                company: agent.company || '',
                division: agent.division || '',
                costCenter: agent.costCenter || '',
              })
              setIsEditDialogOpen(true)
            }}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {agent.email ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Email</span>
              </div>
              <a
                href={`mailto:${agent.email}`}
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                {agent.email}
              </a>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Email</span>
              </div>
              <span className="text-sm text-muted-foreground">Not provided</span>
            </div>
          )}

          {agent.phone ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Phone</span>
              </div>
              <a
                href={`tel:${agent.phone}`}
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                {agent.phone}
              </a>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Phone</span>
              </div>
              <span className="text-sm text-muted-foreground">Not provided</span>
            </div>
          )}

          {agent.title && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Title</span>
              <span className="text-sm text-muted-foreground">{agent.title}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Organization Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {agent.company ? (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Company</span>
              <span className="text-sm text-muted-foreground">{agent.company}</span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Company</span>
              <span className="text-sm text-muted-foreground">Not provided</span>
            </div>
          )}

          {agent.division ? (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Division</span>
              <span className="text-sm text-muted-foreground">{agent.division}</span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Division</span>
              <span className="text-sm text-muted-foreground">Not provided</span>
            </div>
          )}

          {agent.costCenter ? (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cost Center</span>
              <span className="text-sm text-muted-foreground">{agent.costCenter}</span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cost Center</span>
              <span className="text-sm text-muted-foreground">Not provided</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Contact Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Contact Information</DialogTitle>
            <DialogDescription>
              Update contact details for {agent.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Contact Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="agent@company.com"
                    value={editingContact.email}
                    onChange={(e) => setEditingContact({ ...editingContact, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={editingContact.phone}
                    onChange={(e) => setEditingContact({ ...editingContact, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Senior Agent"
                  value={editingContact.title}
                  onChange={(e) => setEditingContact({ ...editingContact, title: e.target.value })}
                />
              </div>
            </div>

            {/* Organization Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Organization</h3>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  placeholder="Company Name"
                  value={editingContact.company}
                  onChange={(e) => setEditingContact({ ...editingContact, company: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="division">Division</Label>
                <Input
                  id="division"
                  placeholder="Division Name"
                  value={editingContact.division}
                  onChange={(e) => setEditingContact({ ...editingContact, division: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="costCenter">Cost Center</Label>
                <Input
                  id="costCenter"
                  placeholder="Cost Center"
                  value={editingContact.costCenter}
                  onChange={(e) => setEditingContact({ ...editingContact, costCenter: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveContact}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
