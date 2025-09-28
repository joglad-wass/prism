'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import {
  Plus,
  Mail,
  MessageSquare,
  Building,
  Calendar,
  User,
  FileText,
  Edit2,
} from 'lucide-react'

import { TalentDetail } from '../../types/talent'

interface TalentNotesProps {
  talent: TalentDetail
}

interface Note {
  id: string
  content: string
  category: string
  status: string
  createdAt: string
  createdBy: string
  updatedAt: string
}

interface Email {
  id: string
  subject: string
  brand: string
  sender: string
  date: string
  status: string
  snippet: string
  content?: string
}

export function TalentNotes({ talent }: TalentNotesProps) {
  const [newNote, setNewNote] = useState('')
  const [newNoteCategory, setNewNoteCategory] = useState('')
  const [newNoteStatus, setNewNoteStatus] = useState('open')
  const [newEmailSubject, setNewEmailSubject] = useState('')
  const [newEmailBrand, setNewEmailBrand] = useState('')
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [editingEmail, setEditingEmail] = useState<Email | null>(null)

  // Mock notes data
  const [notes] = useState<Note[]>([
    {
      id: '1',
      content: 'Follow up on endorsement deal timeline. Client expressed interest in extending the partnership for Q2 and potentially expanding into social media campaigns.',
      category: 'Business Development',
      status: 'open',
      createdAt: '2024-01-15',
      createdBy: 'Sarah Johnson',
      updatedAt: '2024-01-15',
    },
    {
      id: '2',
      content: 'Discussed potential collaboration with Nike for upcoming campaign. Need to review contract terms and negotiate better commission structure.',
      category: 'Partnerships',
      status: 'actioned',
      createdAt: '2024-01-10',
      createdBy: 'Mike Chen',
      updatedAt: '2024-01-12',
    },
    {
      id: '3',
      content: 'Client requested meeting to discuss Q2 marketing strategy and budget allocation for social media presence.',
      category: 'Strategy',
      status: 'done',
      createdAt: '2024-01-05',
      createdBy: 'Alex Rivera',
      updatedAt: '2024-01-08',
    },
  ])

  // Mock email data
  const [emails] = useState<Email[]>([
    {
      id: '1',
      subject: 'Q1 Campaign Performance Review',
      brand: 'Nike',
      sender: 'marketing@nike.com',
      date: '2024-01-20',
      status: 'read',
      snippet: 'Great results from the Q1 campaign. Let\'s schedule a follow-up meeting...',
      content: 'Hi team,\n\nGreat results from the Q1 campaign. The engagement rates exceeded our expectations by 15%. Let\'s schedule a follow-up meeting to discuss Q2 strategy and potential expansion of the partnership.\n\nBest regards,\nNike Marketing Team',
    },
    {
      id: '2',
      subject: 'Contract Amendment Request',
      brand: 'Adidas',
      sender: 'legal@adidas.com',
      date: '2024-01-18',
      status: 'unread',
      snippet: 'We need to discuss some amendments to the existing contract terms...',
      content: 'Dear partners,\n\nWe need to discuss some amendments to the existing contract terms regarding exclusivity clauses and social media usage rights. Please review the attached document and let us know your thoughts.\n\nRegards,\nAdidas Legal Team',
    },
    {
      id: '3',
      subject: 'Event Participation Invitation',
      brand: 'Under Armour',
      sender: 'events@underarmour.com',
      date: '2024-01-15',
      status: 'read',
      snippet: 'We would like to invite your client to participate in our upcoming...',
      content: 'Hello,\n\nWe would like to invite your client to participate in our upcoming product launch event in Los Angeles. This would be a great opportunity for brand exposure and networking.\n\nBest,\nUnder Armour Events Team',
    },
  ])

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'open':
        return 'destructive'
      case 'actioned':
        return 'default'
      case 'done':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note)
  }

  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email)
  }

  const handleEditNote = (note: Note) => {
    setEditingNote({ ...note })
    setSelectedNote(null)
  }

  const handleEditEmail = (email: Email) => {
    setEditingEmail({ ...email })
    setSelectedEmail(null)
  }

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList>
          <TabsTrigger value="insights">Notes & Insights</TabsTrigger>
          <TabsTrigger value="emails">Email Log</TabsTrigger>
        </TabsList>

        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Notes & Insights</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Track important notes, insights, and action items for {talent.name}
                  </p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Note
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Note</DialogTitle>
                      <DialogDescription>
                        Create a new note or insight for {talent.name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Category</label>
                          <Select value={newNoteCategory} onValueChange={setNewNoteCategory}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Business Development">Business Development</SelectItem>
                              <SelectItem value="Partnerships">Partnerships</SelectItem>
                              <SelectItem value="Strategy">Strategy</SelectItem>
                              <SelectItem value="Performance">Performance</SelectItem>
                              <SelectItem value="Personal">Personal</SelectItem>
                              <SelectItem value="Legal">Legal</SelectItem>
                              <SelectItem value="Financial">Financial</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Status</label>
                          <Select value={newNoteStatus} onValueChange={setNewNoteStatus}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="actioned">Actioned</SelectItem>
                              <SelectItem value="done">Done</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Note</label>
                        <Textarea
                          placeholder="Enter your note or insight..."
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          rows={4}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline">Cancel</Button>
                        <Button>Save Note</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-2/5">Note</TableHead>
                    <TableHead className="w-1/6">Category</TableHead>
                    <TableHead className="w-1/12">Status</TableHead>
                    <TableHead className="w-1/12">Created</TableHead>
                    <TableHead className="w-1/6">Created By</TableHead>
                    <TableHead className="w-1/12">Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notes.map((note) => (
                    <TableRow key={note.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleNoteClick(note)}>
                      <TableCell className="w-2/5">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span className="text-sm line-clamp-2">{truncateText(note.content, 80)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="w-1/6">
                        <Badge variant="outline" className="text-xs">{note.category}</Badge>
                      </TableCell>
                      <TableCell className="w-1/12">
                        <Badge variant={getStatusVariant(note.status)} className="text-xs">
                          {note.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground w-1/12">
                        {formatDate(note.createdAt)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground w-1/6">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span className="truncate">{note.createdBy}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground w-1/12">
                        {formatDate(note.updatedAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emails">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Email Log</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Track email communications and brand associations
                  </p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Log Email
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Log New Email</DialogTitle>
                      <DialogDescription>
                        Record an email communication for {talent.name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Subject</label>
                        <Input
                          placeholder="Email subject..."
                          value={newEmailSubject}
                          onChange={(e) => setNewEmailSubject(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Associated Brand</label>
                        <Select value={newEmailBrand} onValueChange={setNewEmailBrand}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select brand" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Nike">Nike</SelectItem>
                            <SelectItem value="Adidas">Adidas</SelectItem>
                            <SelectItem value="Under Armour">Under Armour</SelectItem>
                            <SelectItem value="Puma">Puma</SelectItem>
                            <SelectItem value="New Balance">New Balance</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline">Cancel</Button>
                        <Button>Log Email</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/4">Subject</TableHead>
                    <TableHead className="w-1/6">Brand</TableHead>
                    <TableHead className="w-1/6">Sender</TableHead>
                    <TableHead className="w-1/8">Date</TableHead>
                    <TableHead className="w-1/12">Status</TableHead>
                    <TableHead className="w-1/3">Preview</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emails.map((email) => (
                    <TableRow key={email.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleEmailClick(email)}>
                      <TableCell className="w-1/4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium truncate">{email.subject}</span>
                        </div>
                      </TableCell>
                      <TableCell className="w-1/6">
                        <div className="flex items-center gap-2">
                          <Building className="h-3 w-3" />
                          <Badge variant="outline" className="text-xs">{email.brand}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground w-1/6 truncate">
                        {email.sender}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground w-1/8">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(email.date)}
                        </div>
                      </TableCell>
                      <TableCell className="w-1/12">
                        <Badge variant={email.status === 'read' ? 'secondary' : 'default'} className="text-xs">
                          {email.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="w-1/3">
                        <div className="flex items-start gap-2">
                          <FileText className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground truncate">
                            {truncateText(email.snippet, 60)}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Note View Dialog */}
      <Dialog open={!!selectedNote} onOpenChange={() => setSelectedNote(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Note Details</DialogTitle>
                <DialogDescription>
                  {selectedNote?.category} • {selectedNote && formatDate(selectedNote.createdAt)}
                </DialogDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectedNote && handleEditNote(selectedNote)}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge variant={selectedNote ? getStatusVariant(selectedNote.status) : 'outline'}>
                {selectedNote?.status}
              </Badge>
              <Badge variant="outline">{selectedNote?.category}</Badge>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm">{selectedNote?.content}</p>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Created by {selectedNote?.createdBy}
              </div>
              <div>
                Last updated: {selectedNote && formatDate(selectedNote.updatedAt)}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Note Edit Dialog */}
      <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>
              Update the note details and status
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={editingNote?.category || ''}
                  onValueChange={(value) => editingNote && setEditingNote({...editingNote, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Business Development">Business Development</SelectItem>
                    <SelectItem value="Partnerships">Partnerships</SelectItem>
                    <SelectItem value="Strategy">Strategy</SelectItem>
                    <SelectItem value="Performance">Performance</SelectItem>
                    <SelectItem value="Personal">Personal</SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                    <SelectItem value="Financial">Financial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={editingNote?.status || ''}
                  onValueChange={(value) => editingNote && setEditingNote({...editingNote, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="actioned">Actioned</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Note</label>
              <Textarea
                value={editingNote?.content || ''}
                onChange={(e) => editingNote && setEditingNote({...editingNote, content: e.target.value})}
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingNote(null)}>Cancel</Button>
              <Button>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email View Dialog */}
      <Dialog open={!!selectedEmail} onOpenChange={() => setSelectedEmail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>{selectedEmail?.subject}</DialogTitle>
                <DialogDescription>
                  From {selectedEmail?.sender} • {selectedEmail && formatDate(selectedEmail.date)}
                </DialogDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectedEmail && handleEditEmail(selectedEmail)}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge variant={selectedEmail?.status === 'read' ? 'secondary' : 'default'}>
                {selectedEmail?.status}
              </Badge>
              <Badge variant="outline">{selectedEmail?.brand}</Badge>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{selectedEmail?.content}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Edit Dialog */}
      <Dialog open={!!editingEmail} onOpenChange={() => setEditingEmail(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Email</DialogTitle>
            <DialogDescription>
              Update the email details and brand association
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input
                value={editingEmail?.subject || ''}
                onChange={(e) => editingEmail && setEditingEmail({...editingEmail, subject: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Associated Brand</label>
              <Select
                value={editingEmail?.brand || ''}
                onValueChange={(value) => editingEmail && setEditingEmail({...editingEmail, brand: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nike">Nike</SelectItem>
                  <SelectItem value="Adidas">Adidas</SelectItem>
                  <SelectItem value="Under Armour">Under Armour</SelectItem>
                  <SelectItem value="Puma">Puma</SelectItem>
                  <SelectItem value="New Balance">New Balance</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={editingEmail?.status || ''}
                onValueChange={(value) => editingEmail && setEditingEmail({...editingEmail, status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingEmail(null)}>Cancel</Button>
              <Button>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}