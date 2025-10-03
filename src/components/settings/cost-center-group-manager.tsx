'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { Label } from '../ui/label'
import { Plus, Lock, LockOpen, Search, GripVertical, Users, X } from 'lucide-react'
import { cn } from '../../lib/utils'

interface CostCenterGroup {
  id: string
  groupName: string
  displayName: string
  costCenters: string[]
  pattern: string | null
  isSystem: boolean
}

interface DraggableCostCenter {
  id: string
  name: string
  sourceGroupId?: string
}

export function CostCenterGroupManager() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeDrag, setActiveDrag] = useState<DraggableCostCenter | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    displayName: '',
    groupName: ''
  })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Fetch all cost center groups
  const { data: groupsData } = useQuery({
    queryKey: ['cost-center-groups'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3001/api/cost-center-groups')
      const data = await response.json()
      return data
    }
  })

  // Fetch all cost centers (grouped and ungrouped)
  const { data: costCentersData } = useQuery({
    queryKey: ['cost-centers'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3001/api/cost-centers')
      const data = await response.json()
      return data
    }
  })

  // Mutation to update cost centers in a group
  const updateCostCentersMutation = useMutation({
    mutationFn: async ({ groupId, costCentersToAdd, costCentersToRemove }: {
      groupId: string
      costCentersToAdd?: string[]
      costCentersToRemove?: string[]
    }) => {
      const response = await fetch(`http://localhost:3001/api/cost-center-groups/${groupId}/cost-centers`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ costCentersToAdd, costCentersToRemove })
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-center-groups'] })
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] })
    }
  })

  // Mutation to convert pattern group to manual
  const convertToManualMutation = useMutation({
    mutationFn: async (groupId: string) => {
      const response = await fetch(`http://localhost:3001/api/cost-center-groups/${groupId}/convert-to-manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-center-groups'] })
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] })
    }
  })

  // Mutation to create new group
  const createGroupMutation = useMutation({
    mutationFn: async (data: { displayName: string; groupName: string }) => {
      const response = await fetch('http://localhost:3001/api/cost-center-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: data.displayName,
          groupName: data.groupName,
          costCenters: [],
          isSystem: false
        })
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-center-groups'] })
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] })
      setIsCreateDialogOpen(false)
      setFormData({ displayName: '', groupName: '' })
    }
  })

  const groups: CostCenterGroup[] = groupsData?.data || []
  const ungroupedCostCenters: string[] = costCentersData?.data?.ungrouped || []

  const filteredUngrouped = ungroupedCostCenters.filter(cc =>
    cc.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const costCenterName = active.id as string
    const sourceGroup = groups.find(g => g.costCenters.includes(costCenterName))

    setActiveDrag({
      id: costCenterName,
      name: costCenterName,
      sourceGroupId: sourceGroup?.id
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveDrag(null)

    if (!over) return

    const costCenterName = active.id as string
    const targetGroupId = over.id as string
    const sourceGroup = groups.find(g => g.costCenters.includes(costCenterName))

    // Dropped on ungrouped area
    if (targetGroupId === 'ungrouped') {
      if (sourceGroup && !sourceGroup.pattern) {
        updateCostCentersMutation.mutate({
          groupId: sourceGroup.id,
          costCentersToRemove: [costCenterName]
        })
      }
      return
    }

    // Dropped on a group
    const targetGroup = groups.find(g => g.id === targetGroupId)
    if (!targetGroup || targetGroup.pattern) return // Can't drop on pattern-based groups

    // If from ungrouped, add to target
    if (!sourceGroup) {
      updateCostCentersMutation.mutate({
        groupId: targetGroupId,
        costCentersToAdd: [costCenterName]
      })
    }
    // If from another manual group, remove from source and add to target
    else if (!sourceGroup.pattern && sourceGroup.id !== targetGroupId) {
      updateCostCentersMutation.mutate({
        groupId: sourceGroup.id,
        costCentersToRemove: [costCenterName]
      })
      updateCostCentersMutation.mutate({
        groupId: targetGroupId,
        costCentersToAdd: [costCenterName]
      })
    }
  }

  const trimCostCenterName = (cc: string) => {
    return cc.replace(/^CC\d{3}\s*/, '').trim() || cc
  }

  const handleCreateGroup = () => {
    if (!formData.displayName || !formData.groupName) return
    createGroupMutation.mutate(formData)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-2 gap-6">
        {/* Left Panel - Groups */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Cost Center Groups
            </h3>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Group</DialogTitle>
                  <DialogDescription>
                    Create an empty manual group. You can drag cost centers into it.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Display Name</Label>
                    <Input
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      placeholder="e.g., North America"
                    />
                  </div>
                  <div>
                    <Label>Group ID (no spaces)</Label>
                    <Input
                      value={formData.groupName}
                      onChange={(e) => setFormData({ ...formData, groupName: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      placeholder="e.g., north-america"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateGroup} disabled={!formData.displayName || !formData.groupName || createGroupMutation.isPending}>
                    Create Group
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Accordion type="multiple" className="w-full">
            {groups.map((group) => (
              <AccordionItem key={group.id} value={group.id}>
                <div className="flex items-center justify-between">
                  <AccordionTrigger className="hover:no-underline flex-1">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{group.displayName}</span>
                        {group.pattern && <Lock className="h-3 w-3 text-muted-foreground" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {group.costCenters.length}
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  {group.pattern && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 mr-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm(`Convert "${group.displayName}" to a manual group? This will freeze the current cost centers and allow you to edit them.`)) {
                          convertToManualMutation.mutate(group.id)
                        }
                      }}
                      disabled={convertToManualMutation.isPending}
                    >
                      <LockOpen className="h-3 w-3 mr-1" />
                      <span className="text-xs">Unlock</span>
                    </Button>
                  )}
                </div>
                <AccordionContent>
                  <DropZone
                    id={group.id}
                    isActive={activeDrag !== null && !group.pattern}
                    disabled={!!group.pattern}
                  >
                    <div className="space-y-1">
                      {group.costCenters.length === 0 ? (
                        <div className="text-sm text-muted-foreground text-center py-4">
                          {group.pattern ? "No matching cost centers" : "Drag cost centers here"}
                        </div>
                      ) : (
                        group.costCenters.map((cc) => (
                          <DraggableCostCenterCard
                            key={cc}
                            id={cc}
                            name={trimCostCenterName(cc)}
                            isDraggable={!group.pattern}
                          />
                        ))
                      )}
                    </div>
                  </DropZone>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Right Panel - Ungrouped Cost Centers */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Ungrouped Cost Centers</h3>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cost centers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <DropZone id="ungrouped" isActive={activeDrag !== null}>
            <div className="space-y-1 max-h-[600px] overflow-y-auto">
              {filteredUngrouped.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">
                  {searchTerm ? "No cost centers found" : "All cost centers are grouped"}
                </div>
              ) : (
                filteredUngrouped.map((cc) => (
                  <DraggableCostCenterCard
                    key={cc}
                    id={cc}
                    name={trimCostCenterName(cc)}
                    isDraggable={true}
                  />
                ))
              )}
            </div>
          </DropZone>
        </div>
      </div>

      <DragOverlay>
        {activeDrag && (
          <div className="bg-background border rounded-lg p-2 shadow-lg flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{trimCostCenterName(activeDrag.name)}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

// Draggable Cost Center Card Component
function DraggableCostCenterCard({ id, name, isDraggable }: {
  id: string
  name: string
  isDraggable: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled: !isDraggable,
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isDraggable ? { ...listeners, ...attributes } : {})}
      className={cn(
        "flex items-center gap-2 p-2 rounded border bg-card text-sm transition-colors",
        isDraggable && "cursor-grab active:cursor-grabbing hover:bg-muted/50",
        isDragging && "opacity-50",
        !isDraggable && "opacity-60 cursor-not-allowed"
      )}
    >
      {isDraggable && <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
      {!isDraggable && <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
      <span className="truncate">{name}</span>
    </div>
  )
}

// Drop Zone Component
function DropZone({ id, children, isActive, disabled }: {
  id: string
  children: React.ReactNode
  isActive: boolean
  disabled?: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    disabled,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[100px] rounded-lg p-2 transition-colors",
        isActive && !disabled && "border-2 border-dashed border-primary/50",
        isOver && !disabled && "bg-primary/5",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {children}
    </div>
  )
}

// Import hooks from @dnd-kit
import { useDraggable, useDroppable } from '@dnd-kit/core'
