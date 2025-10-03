'use client'

import { useState, useEffect, useRef } from 'react'
import { useUser } from '../../contexts/user-context'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Camera, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function ProfileForm() {
  const { user, isLoading: userLoading, updateUser } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [divisions, setDivisions] = useState<string[]>([])
  const [costCenters, setCostCenters] = useState<string[]>([])
  const [costCenterGroups, setCostCenterGroups] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<{
    name: string
    email: string
    division: string
    costCenter: string
    userType: 'AGENT' | 'ADMINISTRATOR'
    profilePictureUrl: string
  }>({
    name: '',
    email: '',
    division: '',
    costCenter: '',
    userType: 'AGENT',
    profilePictureUrl: '',
  })

  useEffect(() => {
    if (user) {
      console.log('User data received:', user)
      console.log('User type from API:', user.userType)
      const newFormData = {
        name: user.name || '',
        email: user.email || '',
        division: user.division || '',
        costCenter: user.costCenter || '',
        userType: (user.userType || 'AGENT') as 'AGENT' | 'ADMINISTRATOR',
        profilePictureUrl: user.profilePictureUrl || '',
      }
      console.log('Setting form data:', newFormData)
      setFormData(newFormData)
    }
  }, [user])

  useEffect(() => {
    fetchDivisions()
    fetchCostCenters()
  }, [])

  const fetchDivisions = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/divisions')
      const data = await response.json()
      if (data.success) {
        setDivisions(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch divisions:', error)
    }
  }

  const fetchCostCenters = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/cost-centers')
      const data = await response.json()
      if (data.success && data.data) {
        setCostCenterGroups(data.data.groups || [])
        setCostCenters(data.data.ungrouped || [])
      }
    } catch (error) {
      console.error('Failed to fetch cost centers:', error)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // In a real application, you would upload this to a file storage service
      // For now, we'll just create a local URL
      const imageUrl = URL.createObjectURL(file)
      setFormData({ ...formData, profilePictureUrl: imageUrl })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await updateUser(formData)
      toast.success('Profile updated successfully!', {
        description: 'Your changes have been saved and the UI has been updated.',
      })
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('Failed to update profile', {
        description: 'Please try again or contact support if the issue persists.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>
            Manage your profile information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={formData.profilePictureUrl} alt={formData.name} />
                <AvatarFallback className="text-2xl">
                  {getInitials(formData.name)}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Click the camera icon to upload a profile picture
            </p>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          {/* Division */}
          <div className="space-y-2">
            <Label htmlFor="division">Division</Label>
            <Select
              value={formData.division}
              onValueChange={(value) => setFormData({ ...formData, division: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select division" />
              </SelectTrigger>
              <SelectContent>
                {divisions.map((division) => (
                  <SelectItem key={division} value={division}>
                    {division}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cost Center */}
          <div className="space-y-2">
            <Label htmlFor="costCenter">Cost Center</Label>
            <Select
              value={formData.costCenter}
              onValueChange={(value) => setFormData({ ...formData, costCenter: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select cost center" />
              </SelectTrigger>
              <SelectContent>
                {/* Grouped cost centers */}
                {costCenterGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.displayName} (Group)
                  </SelectItem>
                ))}
                {/* Individual cost centers */}
                {costCenters.map((cc) => (
                  <SelectItem key={cc} value={cc}>
                    {cc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* User Type */}
          <div className="space-y-2">
            <Label htmlFor="userType">User Type</Label>
            <Select
              key={`userType-${formData.userType}`}
              value={formData.userType}
              onValueChange={(value: 'AGENT' | 'ADMINISTRATOR') => {
                console.log('User type changed to:', value)
                setFormData({ ...formData, userType: value })
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AGENT">Agent</SelectItem>
                <SelectItem value="ADMINISTRATOR">Administrator</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {formData.userType === 'ADMINISTRATOR'
                ? 'Administrators can filter by all cost centers'
                : 'Agents can only filter by their assigned cost center or group'}
            </p>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}
