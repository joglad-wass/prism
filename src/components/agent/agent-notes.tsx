'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import {
  StickyNote,
  Plus,
  Calendar,
  User
} from 'lucide-react'

import { Agent } from '../../types'

interface AgentNotesProps {
  agent: Agent
}

export function AgentNotes({ agent }: AgentNotesProps) {
  const [isAddNoteDialogOpen, setIsAddNoteDialogOpen] = useState(false)
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'GENERAL' as const,
    status: 'OPEN' as const,
  })

  const handleAddNote = async () => {
    try {
      // In a real implementation, this would call an API to create the note
      console.log('Creating note:', {
        agentId: agent.id,
        ...newNote
      })
      setIsAddNoteDialogOpen(false)
      setNewNote({
        title: '',
        content: '',
        category: 'GENERAL',
        status: 'OPEN',
      })
    } catch (error) {
      console.error('Failed to create note:', error)
    }
  }

  const getCategoryVariant = (category: string) => {
    switch (category) {
      case 'BUSINESS':
        return 'default'
      case 'PERSONAL':
        return 'secondary'
      case 'FOLLOW_UP':
        return 'outline'
      case 'MEETING':
        return 'default'
      case 'EMAIL':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'default'
      case 'IN_PROGRESS':
        return 'secondary'
      case 'COMPLETED':
        return 'outline'
      case 'CANCELLED':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const notes = agent.notes || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Notes</h3>
          <p className="text-sm text-muted-foreground">
            Track important information and follow-ups
          </p>
        </div>
        <Dialog open={isAddNoteDialogOpen} onOpenChange={setIsAddNoteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Note</DialogTitle>
              <DialogDescription>
                Create a new note for {agent.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Note title"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Note content..."
                  rows={6}
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newNote.category}
                    onValueChange={(value: any) => setNewNote({ ...newNote, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GENERAL">General</SelectItem>
                      <SelectItem value="BUSINESS">Business</SelectItem>
                      <SelectItem value="PERSONAL">Personal</SelectItem>
                      <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
                      <SelectItem value="MEETING">Meeting</SelectItem>
                      <SelectItem value="EMAIL">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newNote.status}
                    onValueChange={(value: any) => setNewNote({ ...newNote, status: value })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddNoteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddNote}>
                  Create Note
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Notes List */}
      {notes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <StickyNote className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No notes yet</p>
            <p className="text-sm mt-1">Create your first note to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {notes.map((note) => (
            <Card key={note.id} className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{note.title}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant={getCategoryVariant(note.category)} className="text-xs">
                      {note.category}
                    </Badge>
                    <Badge variant={getStatusVariant(note.status)} className="text-xs">
                      {note.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {note.content}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(note.createdAt)}
                  </div>
                  {note.author && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {note.author.name}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
