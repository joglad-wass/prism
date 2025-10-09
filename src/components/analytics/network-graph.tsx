'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { AnalyticsService, NetworkNode, NetworkEdge } from '../../services/analytics'
import { useFilter } from '../../contexts/filter-context'
import { useTheme } from '../../contexts/theme-context'
import { Loader2, Network, Users, Building2, UserCircle, ZoomIn, ZoomOut, Search, Filter, X } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'

interface VisualNode extends NetworkNode {
  x: number
  y: number
  vx: number
  vy: number
}

interface Tooltip {
  x: number
  y: number
  node?: VisualNode
  edge?: NetworkEdge & { source: VisualNode, target: VisualNode }
}

export function NetworkGraph() {
  const { filterSelection } = useFilter()
  const { theme } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedNode, setSelectedNode] = useState<VisualNode | null>(null)
  const [hoveredNode, setHoveredNode] = useState<VisualNode | null>(null)
  const [tooltip, setTooltip] = useState<Tooltip | null>(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [entityFilters, setEntityFilters] = useState({
    talents: true,
    brands: true,
    agents: true
  })
  const [isInteracting, setIsInteracting] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [isolateMode, setIsolateMode] = useState(false)
  const interactionTimeoutRef = useRef<NodeJS.Timeout>()
  const lastClickTimeRef = useRef<number>(0)
  const lastClickedNodeRef = useRef<string | null>(null)

  // Determine if dark mode is active
  const isDarkMode = theme === 'dark' || (theme === 'system' &&
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches)

  const filterParams = {
    ...(filterSelection.type === 'individual' && { costCenter: filterSelection.value || undefined }),
    ...(filterSelection.type === 'group' && { costCenterGroup: filterSelection.value || undefined })
  }

  const { data: networkData, isLoading } = useQuery({
    queryKey: ['analytics-network', filterParams],
    queryFn: () => AnalyticsService.getNetworkData(filterParams)
  })

  // Store nodes and edges in refs to avoid recreation
  const nodesRef = useRef<VisualNode[]>([])
  const edgesRef = useRef<NetworkEdge[]>([])
  const animationFrameRef = useRef<number>()
  const originalPositionsRef = useRef<Map<string, { x: number, y: number }>>(new Map())

  // Initialize nodes and edges only when data or filters change
  useEffect(() => {
    if (!networkData || !canvasRef.current) return

    const canvas = canvasRef.current
    const width = canvas.offsetWidth
    const height = canvas.offsetHeight

    // Filter nodes based on entity filters and search
    const filteredNodeData = networkData.nodes.filter(node => {
      const typeMatch = entityFilters[node.type === 'talent' ? 'talents' : node.type === 'brand' ? 'brands' : 'agents']
      const searchMatch = !searchQuery || node.label.toLowerCase().includes(searchQuery.toLowerCase())
      return typeMatch && searchMatch
    })

    const filteredNodeIds = new Set(filteredNodeData.map(n => n.id))

    // Initialize nodes with clustered positions based on type
    nodesRef.current = filteredNodeData.map(node => {
      let baseX, baseY
      // Cluster by type for better initial layout
      if (node.type === 'talent') {
        baseX = width * 0.25
        baseY = height * 0.5
      } else if (node.type === 'brand') {
        baseX = width * 0.75
        baseY = height * 0.5
      } else {
        baseX = width * 0.5
        baseY = height * 0.25
      }

      const x = baseX + (Math.random() - 0.5) * 150
      const y = baseY + (Math.random() - 0.5) * 150

      // Store original positions for restoration
      originalPositionsRef.current.set(node.id, { x, y })

      return {
        ...node,
        x,
        y,
        vx: 0,
        vy: 0
      }
    })

    // Filter edges to only include those between visible nodes
    edgesRef.current = networkData.edges.filter(edge =>
      filteredNodeIds.has(edge.from) && filteredNodeIds.has(edge.to)
    )
  }, [networkData, entityFilters, searchQuery])

  // Refs to track current hover/selection without causing re-renders
  const selectedNodeRef = useRef<VisualNode | null>(null)
  const hoveredNodeRef = useRef<VisualNode | null>(null)

  // Update refs when state changes
  useEffect(() => {
    selectedNodeRef.current = selectedNode
  }, [selectedNode])

  useEffect(() => {
    hoveredNodeRef.current = hoveredNode
  }, [hoveredNode])

  // Update filtered nodes based on isolate mode
  const getFilteredNodes = () => {
    if (!isolateMode || !selectedNodeRef.current) {
      return nodesRef.current
    }

    const connectedIds = new Set<string>()
    edgesRef.current.forEach(edge => {
      if (edge.from === selectedNodeRef.current!.id) connectedIds.add(edge.to)
      if (edge.to === selectedNodeRef.current!.id) connectedIds.add(edge.from)
    })

    return nodesRef.current.filter(node =>
      node.id === selectedNodeRef.current!.id || connectedIds.has(node.id)
    )
  }

  const getFilteredEdges = () => {
    if (!isolateMode || !selectedNodeRef.current) {
      return edgesRef.current
    }

    return edgesRef.current.filter(edge =>
      edge.from === selectedNodeRef.current!.id || edge.to === selectedNodeRef.current!.id
    )
  }

  // Separate effect for rendering and animation
  useEffect(() => {
    if (!canvasRef.current || nodesRef.current.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const width = canvas.width
    const height = canvas.height

    const nodes = getFilteredNodes()
    const edges = getFilteredEdges()

    // Get connected node IDs for highlighting
    const getConnectedNodeIds = (nodeId: string): Set<string> => {
      const connected = new Set<string>()
      edges.forEach(edge => {
        if (edge.from === nodeId) connected.add(edge.to)
        if (edge.to === nodeId) connected.add(edge.from)
      })
      return connected
    }

    // Simple force-directed layout simulation
    const simulate = () => {
      const centerX = width / 2
      const centerY = height / 2

      // Damping factor - slower when interacting
      const dampingFactor = isInteracting ? 0.98 : 0.95
      const forceStrength = isInteracting ? 0.00005 : 0.0001

      // Apply forces
      nodes.forEach(node => {
        // Normal centering force
        const dx = centerX - node.x
        const dy = centerY - node.y
        node.vx += dx * forceStrength
        node.vy += dy * forceStrength

        // Repulsion between nodes
        nodes.forEach(other => {
          if (node.id === other.id) return
          const dx = node.x - other.x
          const dy = node.y - other.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const force = 100 / (dist * dist)
          node.vx += (dx / dist) * force
          node.vy += (dy / dist) * force
        })

        // Attraction along edges
        edges.forEach(edge => {
          if (edge.from === node.id) {
            const target = nodes.find(n => n.id === edge.to)
            if (target) {
              const dx = target.x - node.x
              const dy = target.y - node.y
              node.vx += dx * forceStrength
              node.vy += dy * forceStrength
            }
          }
          if (edge.to === node.id) {
            const source = nodes.find(n => n.id === edge.from)
            if (source) {
              const dx = source.x - node.x
              const dy = source.y - node.y
              node.vx += dx * forceStrength
              node.vy += dy * forceStrength
            }
          }
        })

        // Apply velocity with damping (always moving, just slower)
        node.vx *= dampingFactor
        node.vy *= dampingFactor
        node.x += node.vx
        node.y += node.vy

        // Keep within bounds
        node.x = Math.max(50, Math.min(width - 50, node.x))
        node.y = Math.max(50, Math.min(height - 50, node.y))
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.save()
      ctx.translate(offset.x, offset.y)
      ctx.scale(zoom, zoom)

      const currentSelected = selectedNodeRef.current
      const currentHovered = hoveredNodeRef.current

      const highlightedNodes = (currentSelected || currentHovered)
        ? getConnectedNodeIds((currentSelected || currentHovered)!.id)
        : new Set<string>()
      const isHighlighting = highlightedNodes.size > 0

      // Dark mode colors
      const edgeColor = isDarkMode ? '#3f3f46' : '#e5e7eb'
      const edgeColorDashed = isDarkMode ? '#52525b' : '#cbd5e1'
      const labelColor = isDarkMode ? '#e4e4e7' : '#1f2937'

      // Draw edges
      edges.forEach(edge => {
        const source = nodes.find(n => n.id === edge.from)
        const target = nodes.find(n => n.id === edge.to)
        if (source && target) {
          const isHighlighted = isHighlighting && (
            (currentSelected?.id === source.id || currentSelected?.id === target.id) ||
            (currentHovered?.id === source.id || currentHovered?.id === target.id)
          )

          // Edge styling based on type and highlight state
          ctx.globalAlpha = isHighlighting && !isHighlighted ? 0.15 : 1

          // Different line styles for different edge types
          if (edge.type === 'represents') {
            ctx.setLineDash([5, 5]) // Dashed for agent relationships
            ctx.strokeStyle = isHighlighted ? '#f59e0b' : edgeColorDashed
            ctx.lineWidth = 1.5
          } else {
            ctx.setLineDash([]) // Solid for deals
            // Vary thickness based on deal amount if available
            const thickness = edge.amount ? Math.max(1, Math.min(5, edge.amount / 50000)) : 2
            ctx.lineWidth = isHighlighted ? thickness + 1 : thickness
            ctx.strokeStyle = isHighlighted ? '#10b981' : edgeColor
          }

          ctx.beginPath()
          ctx.moveTo(source.x, source.y)
          ctx.lineTo(target.x, target.y)
          ctx.stroke()
          ctx.setLineDash([])
        }
      })

      ctx.globalAlpha = 1

      // Draw nodes
      nodes.forEach(node => {
        const isNodeHighlighted = isHighlighting && (
          node.id === (currentSelected?.id || currentHovered?.id) ||
          highlightedNodes.has(node.id)
        )

        // Reduce opacity of non-highlighted nodes when highlighting
        ctx.globalAlpha = isHighlighting && !isNodeHighlighted ? 0.2 : 1

        // Size based on deal count or type
        let radius = 8
        if (node.type === 'brand') {
          radius = 10 + (node.dealCount ? Math.min(5, node.dealCount / 2) : 0)
        } else if (node.type === 'talent') {
          radius = 8 + (node.dealCount ? Math.min(4, node.dealCount / 2) : 0)
        } else {
          radius = 6
        }

        // Node color by type
        const colors = {
          talent: '#3b82f6', // blue
          brand: '#10b981',  // green
          agent: '#f59e0b'   // amber
        }

        // Add glow effect for highlighted nodes
        if (isNodeHighlighted) {
          ctx.shadowBlur = 15
          ctx.shadowColor = colors[node.type] || '#6b7280'
        }

        ctx.fillStyle = colors[node.type] || '#6b7280'
        ctx.beginPath()

        // Different shapes for different types
        if (node.type === 'brand') {
          // Square for brands
          ctx.rect(node.x - radius, node.y - radius, radius * 2, radius * 2)
        } else if (node.type === 'agent') {
          // Triangle for agents
          ctx.moveTo(node.x, node.y - radius)
          ctx.lineTo(node.x + radius, node.y + radius)
          ctx.lineTo(node.x - radius, node.y + radius)
          ctx.closePath()
        } else {
          // Circle for talents
          ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI)
        }

        ctx.fill()

        // Reset shadow
        ctx.shadowBlur = 0

        // Highlight selected/hovered node with border
        if (node.id === currentSelected?.id || node.id === currentHovered?.id) {
          ctx.strokeStyle = '#000'
          ctx.lineWidth = 3
          ctx.stroke()
        }

        // Draw labels (scaled with zoom for readability)
        ctx.globalAlpha = 1
        const fontSize = Math.max(10, 12 / zoom)
        ctx.font = `${fontSize}px sans-serif`
        ctx.fillStyle = labelColor
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'

        // Truncate long labels
        let label = node.label
        const maxWidth = 80
        const metrics = ctx.measureText(label)
        if (metrics.width > maxWidth) {
          while (ctx.measureText(label + '...').width > maxWidth && label.length > 0) {
            label = label.slice(0, -1)
          }
          label += '...'
        }

        ctx.fillText(label, node.x, node.y + radius + 4)
      })

      ctx.globalAlpha = 1
      ctx.restore()
    }

    // Continuous animation loop
    const animate = () => {
      simulate() // Always simulate for continuous movement
      draw()
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    // Handle click
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left - offset.x) / zoom
      const y = (e.clientY - rect.top - offset.y) / zoom

      const clicked = nodes.find(node => {
        const dx = node.x - x
        const dy = node.y - y
        let radius = 8
        if (node.type === 'brand') {
          radius = 10 + (node.dealCount ? Math.min(5, node.dealCount / 2) : 0)
        } else if (node.type === 'talent') {
          radius = 8 + (node.dealCount ? Math.min(4, node.dealCount / 2) : 0)
        } else {
          radius = 6
        }
        return Math.sqrt(dx * dx + dy * dy) < radius
      })

      if (clicked) {
        const now = Date.now()
        const timeSinceLastClick = now - lastClickTimeRef.current
        const isDoubleClick = timeSinceLastClick < 300 && lastClickedNodeRef.current === clicked.id

        if (isDoubleClick) {
          // Double-click: activate isolate mode
          setIsolateMode(true)
          setFocusMode(true)
        } else {
          // Single click: just select
          setIsolateMode(false)
          setFocusMode(true)
        }

        setSelectedNode(clicked)
        lastClickTimeRef.current = now
        lastClickedNodeRef.current = clicked.id
      } else {
        // Click on empty space: exit both modes
        setSelectedNode(null)
        setFocusMode(false)
        setIsolateMode(false)
        lastClickedNodeRef.current = null
      }
    }

    // Handle hover for tooltips
    const handleMouseMoveCanvas = (e: MouseEvent) => {
      // Mark as interacting
      setIsInteracting(true)
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current)
      }
      interactionTimeoutRef.current = setTimeout(() => {
        setIsInteracting(false)
      }, 300)

      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left - offset.x) / zoom
      const y = (e.clientY - rect.top - offset.y) / zoom

      // Check for hovered node
      const hovered = nodes.find(node => {
        const dx = node.x - x
        const dy = node.y - y
        let radius = 8
        if (node.type === 'brand') {
          radius = 10 + (node.dealCount ? Math.min(5, node.dealCount / 2) : 0)
        } else if (node.type === 'talent') {
          radius = 8 + (node.dealCount ? Math.min(4, node.dealCount / 2) : 0)
        } else {
          radius = 6
        }
        return Math.sqrt(dx * dx + dy * dy) < radius
      })

      if (hovered) {
        setHoveredNode(hovered)
        setTooltip({
          x: e.clientX,
          y: e.clientY,
          node: hovered
        })
        canvas.style.cursor = 'pointer'
      } else {
        // Check for hovered edge
        let hoveredEdge = null
        for (const edge of edges) {
          const source = nodes.find(n => n.id === edge.from)
          const target = nodes.find(n => n.id === edge.to)
          if (source && target) {
            // Calculate distance from point to line segment
            const A = x - source.x
            const B = y - source.y
            const C = target.x - source.x
            const D = target.y - source.y

            const dot = A * C + B * D
            const lenSq = C * C + D * D
            const param = lenSq !== 0 ? dot / lenSq : -1

            let xx, yy

            if (param < 0) {
              xx = source.x
              yy = source.y
            } else if (param > 1) {
              xx = target.x
              yy = target.y
            } else {
              xx = source.x + param * C
              yy = source.y + param * D
            }

            const dx = x - xx
            const dy = y - yy
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < 5) {
              hoveredEdge = { ...edge, source, target }
              break
            }
          }
        }

        if (hoveredEdge) {
          setHoveredNode(null)
          setTooltip({
            x: e.clientX,
            y: e.clientY,
            edge: hoveredEdge
          })
          canvas.style.cursor = 'pointer'
        } else {
          setHoveredNode(null)
          setTooltip(null)
          canvas.style.cursor = 'move'
        }
      }
    }

    canvas.addEventListener('click', handleClick)
    canvas.addEventListener('mousemove', handleMouseMoveCanvas)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      canvas.removeEventListener('click', handleClick)
      canvas.removeEventListener('mousemove', handleMouseMoveCanvas)
    }
  }, [networkData, zoom, offset, entityFilters, searchQuery, isolateMode])

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(prev => Math.max(0.5, Math.min(3, prev * delta)))
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      {networkData && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Nodes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{networkData.stats.totalNodes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Talents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{networkData.stats.talentCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Brands
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{networkData.stats.brandCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <UserCircle className="h-4 w-4" />
                Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{networkData.stats.agentCount}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Network Visualization */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Relationship Network
              </CardTitle>
              <CardDescription>
                Interactive visualization of talent-brand-agent connections
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setZoom(prev => Math.min(3, prev * 1.2))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setZoom(prev => Math.max(0.5, prev * 0.8))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setZoom(1)
                  setOffset({ x: 0, y: 0 })
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search nodes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {showFilters && (
                <div className="flex items-center gap-6 p-3 border rounded-lg bg-muted/50">
                  <span className="text-sm font-medium">Show:</span>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="filter-talents"
                      checked={entityFilters.talents}
                      onCheckedChange={(checked) =>
                        setEntityFilters(prev => ({ ...prev, talents: checked as boolean }))
                      }
                    />
                    <Label htmlFor="filter-talents" className="cursor-pointer">
                      Talents
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="filter-brands"
                      checked={entityFilters.brands}
                      onCheckedChange={(checked) =>
                        setEntityFilters(prev => ({ ...prev, brands: checked as boolean }))
                      }
                    />
                    <Label htmlFor="filter-brands" className="cursor-pointer">
                      Brands
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="filter-agents"
                      checked={entityFilters.agents}
                      onCheckedChange={(checked) =>
                        setEntityFilters(prev => ({ ...prev, agents: checked as boolean }))
                      }
                    />
                    <Label htmlFor="filter-agents" className="cursor-pointer">
                      Agents
                    </Label>
                  </div>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span>Talents (Circles)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-green-500" />
                <span>Brands (Squares)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-amber-500" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
                <span>Agents (Triangles)</span>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <div className="h-0.5 w-6 bg-gray-300" />
                <span>Deals (Solid)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-0.5 w-6 border-t-2 border-dashed border-gray-300" />
                <span>Represents (Dashed)</span>
              </div>
            </div>

            {/* Canvas */}
            <canvas
              ref={canvasRef}
              className="w-full h-[600px] border rounded-lg cursor-move"
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />

            {/* Tooltip */}
            {tooltip && (
              <div
                className="fixed z-50 pointer-events-none"
                style={{
                  left: tooltip.x + 10,
                  top: tooltip.y + 10,
                }}
              >
                <div className="bg-popover text-popover-foreground p-3 rounded-lg border shadow-lg max-w-xs">
                  {tooltip.node ? (
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold">{tooltip.node.label}</p>
                      <p className="text-xs text-muted-foreground capitalize">{tooltip.node.type}</p>
                      {tooltip.node.category && (
                        <p className="text-xs"><strong>Category:</strong> {tooltip.node.category}</p>
                      )}
                      {tooltip.node.status && (
                        <p className="text-xs"><strong>Status:</strong> {tooltip.node.status}</p>
                      )}
                      {tooltip.node.dealCount !== undefined && tooltip.node.dealCount > 0 && (
                        <p className="text-xs"><strong>Deals:</strong> {tooltip.node.dealCount}</p>
                      )}
                    </div>
                  ) : tooltip.edge ? (
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold capitalize">{tooltip.edge.type}</p>
                      <p className="text-xs">
                        {tooltip.edge.source.label} → {tooltip.edge.target.label}
                      </p>
                      {tooltip.edge.amount && (
                        <p className="text-xs"><strong>Amount:</strong> {formatCurrency(tooltip.edge.amount)}</p>
                      )}
                      {tooltip.edge.isPrimary && (
                        <Badge variant="secondary" className="text-xs">Primary</Badge>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {/* Selected Node Info - Enhanced in Focus Mode */}
            {selectedNode && (
              <Card className={`${focusMode ? 'border-2 border-primary' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{selectedNode.label}</CardTitle>
                      <CardDescription className="capitalize">{selectedNode.type}</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedNode(null)
                        setFocusMode(false)
                        setIsolateMode(false)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`grid gap-3 ${focusMode ? 'md:grid-cols-2' : ''}`}>
                    {selectedNode.category && (
                      <div>
                        <p className="text-sm text-muted-foreground">Category</p>
                        <p className="font-medium">{selectedNode.category}</p>
                      </div>
                    )}
                    {selectedNode.status && (
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className="font-medium">{selectedNode.status}</p>
                      </div>
                    )}
                    {selectedNode.dealCount !== undefined && (
                      <div>
                        <p className="text-sm text-muted-foreground">Deal Count</p>
                        <p className="font-medium">{selectedNode.dealCount}</p>
                      </div>
                    )}
                    {selectedNode.brandType && (
                      <div>
                        <p className="text-sm text-muted-foreground">Brand Type</p>
                        <p className="font-medium">{selectedNode.brandType}</p>
                      </div>
                    )}
                    {focusMode && (
                      <div className="col-span-full">
                        <Badge variant="secondary" className="mt-2">
                          {isolateMode ? 'Isolate Mode - Only connected nodes shown' : 'Focus Mode - Connected relationships highlighted'}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
