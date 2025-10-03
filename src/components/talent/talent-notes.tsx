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
  Phone,
  Clock,
} from 'lucide-react'

import { TalentDetail } from '../../types/talent'
import { useTalentNotes, useNoteMutations, Note as NoteType } from '../../hooks/useNotes'
import { useTalentEmailLogs, useEmailLogMutations, EmailLog } from '../../hooks/useEmailLogs'
import { useTalentCallLogs, useCallLogMutations, CallLog } from '../../hooks/useCallLogs'

interface TalentNotesProps {
  talent: TalentDetail
}

export function TalentNotes({ talent }: TalentNotesProps) {
  const [newNote, setNewNote] = useState('')
  const [newNoteCategory, setNewNoteCategory] = useState('GENERAL')
  const [newNoteStatus, setNewNoteStatus] = useState('OPEN')
  const [newEmail, setNewEmail] = useState({
    subject: '',
    fromEmail: '',
    toEmail: '',
    body: '',
    snippet: '',
    brandId: ''
  })
  const [newCall, setNewCall] = useState({
    subject: '',
    callType: 'outbound',
    duration: 0,
    notes: '',
    outcome: '',
    brandId: ''
  })
  const [selectedNote, setSelectedNote] = useState<NoteType | null>(null)
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null)
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null)
  const [editingNote, setEditingNote] = useState<NoteType | null>(null)
  const [editingEmail, setEditingEmail] = useState<EmailLog | null>(null)
  const [editingCall, setEditingCall] = useState<CallLog | null>(null)
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false)
  const [isAddEmailOpen, setIsAddEmailOpen] = useState(false)
  const [isAddCallOpen, setIsAddCallOpen] = useState(false)

  // Fetch notes from API
  const { data: notes = [], isLoading: notesLoading } = useTalentNotes(talent.id)
  const { createNote, updateNote, deleteNote, isCreating, isUpdating, isDeleting } = useNoteMutations(talent.id)

  // Fetch emails from API
  const { data: emails = [], isLoading: emailsLoading } = useTalentEmailLogs(talent.id)
  const {
    createEmailLog,
    updateEmailLog,
    deleteEmailLog,
    isCreating: isCreatingEmail,
    isUpdating: isUpdatingEmail,
    isDeleting: isDeletingEmail
  } = useEmailLogMutations(talent.id)

  // Fetch calls from API
  const { data: calls = [], isLoading: callsLoading } = useTalentCallLogs(talent.id)
  const {
    createCallLog,
    updateCallLog,
    deleteCallLog,
    isCreating: isCreatingCall,
    isUpdating: isUpdatingCall,
    isDeleting: isDeletingCall
  } = useCallLogMutations(talent.id)

  const getStatusVariant = (status: string) => {
    switch (status.toUpperCase()) {
      case 'OPEN':
        return 'destructive'
      case 'ACTIONED':
        return 'default'
      case 'DONE':
      case 'CLOSED':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const handleNoteClick = (note: NoteType) => {
    setSelectedNote(note)
  }

  const handleEmailClick = (email: EmailLog) => {
    setSelectedEmail(email)
  }

  const handleEditNote = (note: NoteType) => {
    setEditingNote({ ...note })
    setSelectedNote(null)
  }

  const handleEditEmail = (email: EmailLog) => {
    setEditingEmail({ ...email })
    setNewEmail({
      subject: email.subject,
      fromEmail: email.fromEmail,
      toEmail: email.toEmail,
      body: email.body || '',
      snippet: email.snippet || '',
      brandId: email.brandId || ''
    })
    setSelectedEmail(null)
  }

  const handleCreateNote = async () => {
    if (!newNote.trim()) return

    try {
      await createNote({
        content: newNote,
        category: newNoteCategory,
        status: newNoteStatus
      })
      // Reset form
      setNewNote('')
      setNewNoteCategory('GENERAL')
      setNewNoteStatus('OPEN')
      setIsAddNoteOpen(false)
    } catch (error) {
      console.error('Failed to create note:', error)
    }
  }

  const handleUpdateNote = async () => {
    if (!editingNote) return

    try {
      await updateNote({
        noteId: editingNote.id,
        noteData: {
          content: editingNote.content,
          category: editingNote.category,
          status: editingNote.status,
          title: editingNote.title
        }
      })
      setEditingNote(null)
    } catch (error) {
      console.error('Failed to update note:', error)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      await deleteNote(noteId)
      setSelectedNote(null)
      setEditingNote(null)
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  const handleCreateEmail = async () => {
    if (!newEmail.subject.trim() || !newEmail.fromEmail.trim() || !newEmail.toEmail.trim()) return

    try {
      await createEmailLog(newEmail)
      // Reset form
      setNewEmail({
        subject: '',
        fromEmail: '',
        toEmail: '',
        body: '',
        snippet: '',
        brandId: ''
      })
      setIsAddEmailOpen(false)
    } catch (error) {
      console.error('Failed to create email log:', error)
    }
  }

  const handleUpdateEmail = async () => {
    if (!editingEmail) return

    try {
      await updateEmailLog({
        emailId: editingEmail.id,
        emailData: newEmail
      })
      setEditingEmail(null)
      setNewEmail({
        subject: '',
        fromEmail: '',
        toEmail: '',
        body: '',
        snippet: '',
        brandId: ''
      })
    } catch (error) {
      console.error('Failed to update email log:', error)
    }
  }

  const handleDeleteEmail = async (emailId: string) => {
    if (!confirm('Are you sure you want to delete this email log?')) return

    try {
      await deleteEmailLog(emailId)
      setSelectedEmail(null)
      setEditingEmail(null)
    } catch (error) {
      console.error('Failed to delete email log:', error)
    }
  }

  const handleCallClick = (call: CallLog) => {
    setSelectedCall(call)
  }

  const handleEditCall = (call: CallLog) => {
    setEditingCall({ ...call })
    setNewCall({
      subject: call.subject,
      callType: call.callType,
      duration: call.duration || 0,
      notes: call.notes || '',
      outcome: call.outcome || '',
      brandId: call.brandId || ''
    })
    setSelectedCall(null)
  }

  const handleCreateCall = async () => {
    if (!newCall.subject.trim()) return

    try {
      await createCallLog(newCall)
      // Reset form
      setNewCall({
        subject: '',
        callType: 'outbound',
        duration: 0,
        notes: '',
        outcome: '',
        brandId: ''
      })
      setIsAddCallOpen(false)
    } catch (error) {
      console.error('Failed to create call log:', error)
    }
  }

  const handleUpdateCall = async () => {
    if (!editingCall) return

    try {
      await updateCallLog({
        callId: editingCall.id,
        callData: newCall
      })
      setEditingCall(null)
      setNewCall({
        subject: '',
        callType: 'outbound',
        duration: 0,
        notes: '',
        outcome: '',
        brandId: ''
      })
    } catch (error) {
      console.error('Failed to update call log:', error)
    }
  }

  const handleDeleteCall = async (callId: string) => {
    if (!confirm('Are you sure you want to delete this call log?')) return

    try {
      await deleteCallLog(callId)
      setSelectedCall(null)
      setEditingCall(null)
    } catch (error) {
      console.error('Failed to delete call log:', error)
    }
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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
          <TabsTrigger value="calls">Call Log</TabsTrigger>
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
                <Dialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
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
                              <SelectItem value="GENERAL">General</SelectItem>
                              <SelectItem value="BUSINESS_DEVELOPMENT">Business Development</SelectItem>
                              <SelectItem value="PARTNERSHIPS">Partnerships</SelectItem>
                              <SelectItem value="STRATEGY">Strategy</SelectItem>
                              <SelectItem value="PERFORMANCE">Performance</SelectItem>
                              <SelectItem value="PERSONAL">Personal</SelectItem>
                              <SelectItem value="LEGAL">Legal</SelectItem>
                              <SelectItem value="FINANCIAL">Financial</SelectItem>
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
                              <SelectItem value="OPEN">Open</SelectItem>
                              <SelectItem value="ACTIONED">Actioned</SelectItem>
                              <SelectItem value="DONE">Done</SelectItem>
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
                        <Button variant="outline" onClick={() => setIsAddNoteOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateNote} disabled={isCreating}>
                          {isCreating ? 'Saving...' : 'Save Note'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {notesLoading ? (
                <div className="flex justify-center py-8">
                  <p className="text-muted-foreground">Loading notes...</p>
                </div>
              ) : notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No notes yet</p>
                  <p className="text-sm text-muted-foreground">Add your first note to get started</p>
                </div>
              ) : (
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
                          <Badge variant="outline" className="text-xs">
                            {note.category.replace(/_/g, ' ')}
                          </Badge>
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
                            <span className="truncate">{note.author?.name || 'Unknown'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground w-1/12">
                          {formatDate(note.updatedAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
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
                <Dialog open={isAddEmailOpen} onOpenChange={setIsAddEmailOpen}>
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
                        Record an email communication for {talent.Name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Subject</label>
                        <Input
                          placeholder="Email subject..."
                          value={newEmail.subject}
                          onChange={(e) => setNewEmail({ ...newEmail, subject: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">From Email</label>
                        <Input
                          placeholder="sender@example.com"
                          value={newEmail.fromEmail}
                          onChange={(e) => setNewEmail({ ...newEmail, fromEmail: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">To Email</label>
                        <Input
                          placeholder="recipient@example.com"
                          value={newEmail.toEmail}
                          onChange={(e) => setNewEmail({ ...newEmail, toEmail: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email Body</label>
                        <Textarea
                          placeholder="Email content..."
                          value={newEmail.body}
                          onChange={(e) => setNewEmail({ ...newEmail, body: e.target.value })}
                          rows={4}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAddEmailOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateEmail} disabled={isCreatingEmail}>
                          {isCreatingEmail ? 'Logging...' : 'Log Email'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {emailsLoading ? (
                <div className="flex justify-center py-8">
                  <p className="text-muted-foreground">Loading emails...</p>
                </div>
              ) : emails.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Mail className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No emails logged yet</p>
                  <p className="text-sm text-muted-foreground">Log your first email to get started</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/4">Subject</TableHead>
                      <TableHead className="w-1/6">Brand</TableHead>
                      <TableHead className="w-1/6">From</TableHead>
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
                            <Badge variant="outline" className="text-xs">
                              {email.brand?.name || 'No Brand'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground w-1/6 truncate">
                          {email.fromEmail}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground w-1/8">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(email.timestamp)}
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
                              {email.snippet ? truncateText(email.snippet, 60) : 'No preview'}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calls">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Call Log</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Track phone call communications and outcomes
                  </p>
                </div>
                <Dialog open={isAddCallOpen} onOpenChange={setIsAddCallOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Log Call
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Log New Call</DialogTitle>
                      <DialogDescription>
                        Record a phone call for {talent.Name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Subject</label>
                        <Input
                          placeholder="Call subject..."
                          value={newCall.subject}
                          onChange={(e) => setNewCall({ ...newCall, subject: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Call Type</label>
                          <Select value={newCall.callType} onValueChange={(value) => setNewCall({ ...newCall, callType: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="outbound">Outbound</SelectItem>
                              <SelectItem value="inbound">Inbound</SelectItem>
                              <SelectItem value="missed">Missed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Outcome</label>
                          <Select value={newCall.outcome} onValueChange={(value) => setNewCall({ ...newCall, outcome: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select outcome" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="connected">Connected</SelectItem>
                              <SelectItem value="voicemail">Voicemail</SelectItem>
                              <SelectItem value="no_answer">No Answer</SelectItem>
                              <SelectItem value="busy">Busy</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Duration (seconds)</label>
                        <Input
                          type="number"
                          placeholder="Duration in seconds..."
                          value={newCall.duration}
                          onChange={(e) => setNewCall({ ...newCall, duration: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Notes</label>
                        <Textarea
                          placeholder="Call notes..."
                          value={newCall.notes}
                          onChange={(e) => setNewCall({ ...newCall, notes: e.target.value })}
                          rows={4}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAddCallOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateCall} disabled={isCreatingCall}>
                          {isCreatingCall ? 'Logging...' : 'Log Call'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {callsLoading ? (
                <div className="flex justify-center py-8">
                  <p className="text-muted-foreground">Loading calls...</p>
                </div>
              ) : calls.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Phone className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No calls logged yet</p>
                  <p className="text-sm text-muted-foreground">Log your first call to get started</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/4">Subject</TableHead>
                      <TableHead className="w-1/8">Type</TableHead>
                      <TableHead className="w-1/8">Outcome</TableHead>
                      <TableHead className="w-1/8">Duration</TableHead>
                      <TableHead className="w-1/8">Date</TableHead>
                      <TableHead className="w-1/3">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {calls.map((call) => (
                      <TableRow key={call.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleCallClick(call)}>
                        <TableCell className="w-1/4">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium truncate">{call.subject}</span>
                          </div>
                        </TableCell>
                        <TableCell className="w-1/8">
                          <Badge variant="outline" className="text-xs">
                            {call.callType}
                          </Badge>
                        </TableCell>
                        <TableCell className="w-1/8">
                          <Badge variant={call.outcome === 'connected' ? 'default' : 'secondary'} className="text-xs">
                            {call.outcome || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="w-1/8">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(call.duration)}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground w-1/8">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(call.timestamp)}
                          </div>
                        </TableCell>
                        <TableCell className="w-1/3">
                          <span className="text-sm text-muted-foreground truncate">
                            {call.notes ? truncateText(call.notes, 60) : 'No notes'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
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
                  {selectedNote?.category.replace(/_/g, ' ')} • {selectedNote && formatDate(selectedNote.createdAt)}
                </DialogDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedNote && handleEditNote(selectedNote)}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => selectedNote && handleDeleteNote(selectedNote.id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge variant={selectedNote ? getStatusVariant(selectedNote.status) : 'outline'}>
                {selectedNote?.status}
              </Badge>
              <Badge variant="outline">{selectedNote?.category.replace(/_/g, ' ')}</Badge>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm">{selectedNote?.content}</p>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Created by {selectedNote?.author?.name || 'Unknown'}
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
                    <SelectItem value="GENERAL">General</SelectItem>
                    <SelectItem value="BUSINESS_DEVELOPMENT">Business Development</SelectItem>
                    <SelectItem value="PARTNERSHIPS">Partnerships</SelectItem>
                    <SelectItem value="STRATEGY">Strategy</SelectItem>
                    <SelectItem value="PERFORMANCE">Performance</SelectItem>
                    <SelectItem value="PERSONAL">Personal</SelectItem>
                    <SelectItem value="LEGAL">Legal</SelectItem>
                    <SelectItem value="FINANCIAL">Financial</SelectItem>
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
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="ACTIONED">Actioned</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
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
              <Button onClick={handleUpdateNote} disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
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
                  From {selectedEmail?.fromEmail} • {selectedEmail && formatDate(selectedEmail.timestamp)}
                </DialogDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedEmail && handleEditEmail(selectedEmail)}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => selectedEmail && handleDeleteEmail(selectedEmail.id)}
                  disabled={isDeletingEmail}
                >
                  {isDeletingEmail ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge variant={selectedEmail?.status === 'read' ? 'secondary' : 'default'}>
                {selectedEmail?.status}
              </Badge>
              <Badge variant="outline">{selectedEmail?.brand?.name || 'No Brand'}</Badge>
            </div>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">To:</span> {selectedEmail?.toEmail}
              </div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{selectedEmail?.body || 'No content'}</p>
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
              Update the email details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input
                value={newEmail.subject}
                onChange={(e) => setNewEmail({ ...newEmail, subject: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">From Email</label>
              <Input
                value={newEmail.fromEmail}
                onChange={(e) => setNewEmail({ ...newEmail, fromEmail: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">To Email</label>
              <Input
                value={newEmail.toEmail}
                onChange={(e) => setNewEmail({ ...newEmail, toEmail: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Body</label>
              <Textarea
                value={newEmail.body}
                onChange={(e) => setNewEmail({ ...newEmail, body: e.target.value })}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={editingEmail?.status || 'unread'}
                onValueChange={(value) => setNewEmail({ ...newEmail, snippet: value })}
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
              <Button onClick={handleUpdateEmail} disabled={isUpdatingEmail}>
                {isUpdatingEmail ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Call View Dialog */}
      <Dialog open={!!selectedCall} onOpenChange={() => setSelectedCall(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>{selectedCall?.subject}</DialogTitle>
                <DialogDescription>
                  {selectedCall?.callType} call • {selectedCall && formatDate(selectedCall.timestamp)}
                </DialogDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedCall && handleEditCall(selectedCall)}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => selectedCall && handleDeleteCall(selectedCall.id)}
                  disabled={isDeletingCall}
                >
                  {isDeletingCall ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge variant="outline">{selectedCall?.callType}</Badge>
              <Badge variant={selectedCall?.outcome === 'connected' ? 'default' : 'secondary'}>
                {selectedCall?.outcome || 'N/A'}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {selectedCall && formatDuration(selectedCall.duration)}
              </div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{selectedCall?.notes || 'No notes recorded'}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Call Edit Dialog */}
      <Dialog open={!!editingCall} onOpenChange={() => setEditingCall(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Call</DialogTitle>
            <DialogDescription>
              Update the call details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input
                value={newCall.subject}
                onChange={(e) => setNewCall({ ...newCall, subject: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Call Type</label>
                <Select value={newCall.callType} onValueChange={(value) => setNewCall({ ...newCall, callType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="outbound">Outbound</SelectItem>
                    <SelectItem value="inbound">Inbound</SelectItem>
                    <SelectItem value="missed">Missed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Outcome</label>
                <Select value={newCall.outcome || ''} onValueChange={(value) => setNewCall({ ...newCall, outcome: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="connected">Connected</SelectItem>
                    <SelectItem value="voicemail">Voicemail</SelectItem>
                    <SelectItem value="no_answer">No Answer</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Duration (seconds)</label>
              <Input
                type="number"
                value={newCall.duration}
                onChange={(e) => setNewCall({ ...newCall, duration: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={newCall.notes}
                onChange={(e) => setNewCall({ ...newCall, notes: e.target.value })}
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingCall(null)}>Cancel</Button>
              <Button onClick={handleUpdateCall} disabled={isUpdatingCall}>
                {isUpdatingCall ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}