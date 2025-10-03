'use client'

import { useState, useEffect } from 'react'
import { useUser } from '../../contexts/user-context'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Loader2, Pencil, Shield, User, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { useLabels } from '../../hooks/useLabels'

interface User {
  id: string
  name: string
  email: string
  division: string | null
  costCenter: string | null
  userType: 'AGENT' | 'ADMINISTRATOR'
  defaultFilterType: string | null
  defaultFilterValue: string | null
}

interface CostCenterOption {
  value: string
  label: string
}

export function UserManager() {
  const { labels } = useLabels()
  const { user: currentUser, refreshUsers, availableUsers } = useUser()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [costCenters, setCostCenters] = useState<CostCenterOption[]>([])
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: '',
    email: '',
    division: null,
    costCenter: null,
    userType: 'AGENT',
  })

  useEffect(() => {
    fetchUsers()
    fetchCostCenters()
  }, [])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('http://localhost:3001/api/users')
      const data = await response.json()
      if (data.success) {
        setUsers(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCostCenters = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/cost-centers')
      const data = await response.json()
      if (data.success && data.data) {
        const allIndividualCCs: CostCenterOption[] = []

        // Add cost centers from groups
        data.data.groups?.forEach((group: any) => {
          if (group.costCenters && Array.isArray(group.costCenters)) {
            group.costCenters.forEach((cc: string) => {
              allIndividualCCs.push({ value: cc, label: cc })
            })
          }
        })

        // Add ungrouped cost centers
        if (data.data.ungrouped && Array.isArray(data.data.ungrouped)) {
          data.data.ungrouped.forEach((cc: string) => {
            allIndividualCCs.push({ value: cc, label: cc })
          })
        }

        // Sort and deduplicate
        const uniqueCCs = Array.from(
          new Map(allIndividualCCs.map(cc => [cc.value, cc])).values()
        ).sort((a, b) => a.label.localeCompare(b.label))

        setCostCenters(uniqueCCs)
      }
    } catch (error) {
      console.error('Failed to fetch cost centers:', error)
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser({ ...user })
    setIsEditDialogOpen(true)
  }

  const handleSaveUser = async () => {
    if (!editingUser) return

    try {
      setIsSaving(true)
      const response = await fetch('http://localhost:3001/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingUser),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('User updated successfully')
        await fetchUsers()
        await refreshUsers()
        setIsEditDialogOpen(false)
      } else {
        toast.error(data.error || 'Failed to update user')
      }
    } catch (error) {
      console.error('Failed to update user:', error)
      toast.error('Failed to update user')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email) {
      toast.error('Name and email are required')
      return
    }

    try {
      setIsSaving(true)
      const response = await fetch('http://localhost:3001/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('User created successfully')
        await fetchUsers()
        await refreshUsers()
        setIsCreateDialogOpen(false)
        setNewUser({
          name: '',
          email: '',
          division: null,
          costCenter: null,
          userType: 'AGENT',
        })
      } else {
        toast.error(data.error || 'Failed to create user')
      }
    } catch (error) {
      console.error('Failed to create user:', error)
      toast.error('Failed to create user')
    } finally {
      setIsSaving(false)
    }
  }

  // Only admins can access this component
  if (currentUser?.userType !== 'ADMINISTRATOR') {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Shield className="h-12 w-12 mx-auto mb-3 opacity-20" />
        <p>You must be an administrator to manage users</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Division</TableHead>
              <TableHead>Cost Center</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.division || '-'}</TableCell>
                  <TableCell>
                    <span className="text-xs">
                      {user.costCenter || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.userType === 'ADMINISTRATOR' ? 'default' : 'secondary'}>
                      {user.userType === 'ADMINISTRATOR' ? (
                        <>
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </>
                      ) : (
                        <>
                          <User className="h-3 w-3 mr-1" />
                          {labels.agent}
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions
            </DialogDescription>
          </DialogHeader>

          {editingUser && (
            <div className="space-y-4 py-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                />
              </div>

              {/* Cost Center */}
              <div className="space-y-2">
                <Label htmlFor="edit-costCenter">Cost Center</Label>
                <Select
                  value={editingUser.costCenter || ''}
                  onValueChange={(value) =>
                    setEditingUser({ ...editingUser, costCenter: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cost center" />
                  </SelectTrigger>
                  <SelectContent>
                    {costCenters.map((cc) => (
                      <SelectItem key={cc.value} value={cc.value}>
                        {cc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Changing the cost center will automatically update the user's filter group
                </p>
              </div>

              {/* User Type */}
              <div className="space-y-2">
                <Label htmlFor="edit-userType">User Type</Label>
                <Select
                  value={editingUser.userType}
                  onValueChange={(value: 'AGENT' | 'ADMINISTRATOR') =>
                    setEditingUser({ ...editingUser, userType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AGENT">{labels.agent}</SelectItem>
                    <SelectItem value="ADMINISTRATOR">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveUser} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="create-name">Name *</Label>
              <Input
                id="create-name"
                value={newUser.name || ''}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
                placeholder="John Doe"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="create-email">Email *</Label>
              <Input
                id="create-email"
                type="email"
                value={newUser.email || ''}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                placeholder="john.doe@example.com"
              />
            </div>

            {/* Division */}
            <div className="space-y-2">
              <Label htmlFor="create-division">Division</Label>
              <Input
                id="create-division"
                value={newUser.division || ''}
                onChange={(e) =>
                  setNewUser({ ...newUser, division: e.target.value })
                }
                placeholder="Talent"
              />
            </div>

            {/* Cost Center */}
            <div className="space-y-2">
              <Label htmlFor="create-costCenter">Cost Center</Label>
              <Select
                value={newUser.costCenter || ''}
                onValueChange={(value) =>
                  setNewUser({ ...newUser, costCenter: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cost center" />
                </SelectTrigger>
                <SelectContent>
                  {costCenters.map((cc) => (
                    <SelectItem key={cc.value} value={cc.value}>
                      {cc.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The user's filter group will be automatically assigned based on their cost center
              </p>
            </div>

            {/* User Type */}
            <div className="space-y-2">
              <Label htmlFor="create-userType">User Type</Label>
              <Select
                value={newUser.userType}
                onValueChange={(value: 'AGENT' | 'ADMINISTRATOR') =>
                  setNewUser({ ...newUser, userType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AGENT">{labels.agent}</SelectItem>
                  <SelectItem value="ADMINISTRATOR">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false)
                setNewUser({
                  name: '',
                  email: '',
                  division: null,
                  costCenter: null,
                  userType: 'AGENT',
                })
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateUser} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create User'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
