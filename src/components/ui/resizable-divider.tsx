'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '../../lib/utils'

interface ResizableDividerProps {
  onResize: (leftPercentage: number) => void
  minLeftPercentage?: number
  maxLeftPercentage?: number
  className?: string
}

export function ResizableDivider({
  onResize,
  minLeftPercentage = 40,
  maxLeftPercentage = 80,
  className,
}: ResizableDividerProps) {
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const mainContainerRef = useRef<HTMLElement | null>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Find and store the main flex container (grandparent)
    if (containerRef.current) {
      const parent = containerRef.current.parentElement
      if (parent) {
        mainContainerRef.current = parent.parentElement
      }
    }

    setIsDragging(true)
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !mainContainerRef.current) return

      e.preventDefault()
      e.stopPropagation()

      const containerRect = mainContainerRef.current.getBoundingClientRect()
      const mouseX = e.clientX - containerRect.left
      const percentage = (mouseX / containerRect.width) * 100

      // Clamp between min and max
      const clampedPercentage = Math.max(
        minLeftPercentage,
        Math.min(maxLeftPercentage, percentage)
      )

      onResize(clampedPercentage)
    },
    [isDragging, minLeftPercentage, maxLeftPercentage, onResize]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      className={cn(
        'relative w-4 flex items-center justify-center cursor-col-resize group mx-2',
        className
      )}
    >
      {/* Visual handle indicator */}
      <div className={cn(
        'w-1 h-16 bg-border group-hover:bg-primary/70 rounded-full transition-colors',
        isDragging && 'bg-primary'
      )} />
    </div>
  )
}
