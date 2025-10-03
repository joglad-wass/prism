'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import {
  Plus,
  MessageSquare,
  User,
  Calendar,
  Tag,
  Edit,
  Trash2,
} from 'lucide-react'
import { Brand } from '../../types'

interface Note {
  id: string
  title: string
  content: string
  category: string
  status: string
  createdAt: string
  updatedAt: string
  author?: {
    name: string
  }
}

interface BrandNotesProps {
  brand: Brand
}

export function BrandNotes({ brand }: BrandNotesProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'GENERAL',
    status: 'OPEN',
  })

  // For now, we don't have notes in the brand type, so we'll use empty array
  const notes: Note[] = []

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCategoryVariant = (category: string) => {
    switch (category) {
      case 'BUSINESS':
        return 'default'
      case 'MEETING':
        return 'secondary'
      case 'FOLLOW_UP':
        return 'outline'
      case 'EMAIL':
        return 'destructive'
      case 'PERSONAL':
        return 'outline'
      default:
        return 'secondary'
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

  const handleCreateNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      return
    }

    try {
      // In a real implementation, this would call an API to create the note
      console.log('Creating note:', {
        ...newNote,
        brandId: brand.id
      })

      setIsCreateDialogOpen(false)
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

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setNewNote({
      title: note.title,
      content: note.content,
      category: note.category || 'GENERAL',
      status: note.status || 'OPEN',
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateNote = async () => {
    if (!editingNote || !newNote.title.trim() || !newNote.content.trim()) {
      return
    }

    try {
      // In a real implementation, this would call an API to update the note
      console.log('Updating note:', {
        noteId: editingNote.id,
        ...newNote
      })

      setIsEditDialogOpen(false)
      setEditingNote(null)
      setNewNote({
        title: '',
        content: '',
        category: 'GENERAL',
        status: 'OPEN',
      })
    } catch (error) {
      console.error('Failed to update note:', error)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return
    }

    try {
      // In a real implementation, this would call an API to delete the note
      console.log('Deleting note:', noteId)
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  const notesByCategory = notes.reduce((acc, note) => {
    if (!acc[note.category]) {
      acc[note.category] = []
    }
    acc[note.category].push(note)
    return acc
  }, {} as Record<string, Note[]>)

  return (
    <div className="space-y-6">
      {/* Notes Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notes.length}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Notes</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notes.filter(note => note.status === 'OPEN' || note.status === 'IN_PROGRESS').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Open & In Progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(notesByCategory).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Different types
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Notes List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Brand Notes</CardTitle>
              <CardDescription>
                Track communications, updates, and important information
              </CardDescription>
            </div>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Note
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Note</DialogTitle>
                  <DialogDescription>
                    Add a note or update about {brand.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Note Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter note title..."
                      value={newNote.title}
                      onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Note Content</Label>
                    <Textarea
                      id="content"
                      placeholder="Enter your note here..."
                      rows={4}
                      value={newNote.content}
                      onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newNote.category}
                      onValueChange={(value) => setNewNote({ ...newNote, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
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
                      onValueChange={(value) => setNewNote({ ...newNote, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateNote}>
                      Add Note
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Edit Note Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Note</DialogTitle>
                  <DialogDescription>
                    Update the note details
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Note Title</Label>
                    <Input
                      id="edit-title"
                      placeholder="Enter note title..."
                      value={newNote.title}
                      onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-content">Note Content</Label>
                    <Textarea
                      id="edit-content"
                      placeholder="Enter your note here..."
                      rows={4}
                      value={newNote.content}
                      onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Category</Label>
                    <Select
                      value={newNote.category}
                      onValueChange={(value) => setNewNote({ ...newNote, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
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
                    <Label htmlFor="edit-status">Status</Label>
                    <Select
                      value={newNote.status}
                      onValueChange={(value) => setNewNote({ ...newNote, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateNote}>
                      Update Note
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {notes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="font-medium mb-2">No notes yet</h3>
              <p className="text-sm">Start tracking brand progress by adding your first note</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((note) => (
                <Card key={note.id} className="relative">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      {/* Note header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={getCategoryVariant(note.category)}>
                            {note.category}
                          </Badge>
                          <Badge variant={getStatusVariant(note.status)}>
                            {note.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditNote(note)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Note title and content */}
                      <div className="space-y-2">
                        <div className="font-medium text-sm">{note.title}</div>
                        <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {note.content}
                        </div>
                      </div>

                      {/* Note metadata */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {note.author?.name || 'Unknown'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(note.createdAt)}
                          </div>
                        </div>

                        {note.updatedAt !== note.createdAt && (
                          <div className="text-xs text-muted-foreground">
                            Updated {formatDate(note.updatedAt)}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes by Category */}
      {Object.keys(notesByCategory).length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Notes by Category</CardTitle>
            <CardDescription>
              Overview of notes organized by type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(notesByCategory).map(([category, categoryNotes]) => (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={getCategoryVariant(category)}>
                      {category}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {categoryNotes.length}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Last: {formatDate(categoryNotes[0]?.createdAt || '')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
