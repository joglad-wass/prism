/**
 * Export utilities for downloading data as CSV or JSON
 */

export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    console.warn('No data to export')
    return
  }

  const csvRows: string[] = []
  let currentSection: string | null = null
  let sectionData: any[] = []

  // Process data with section awareness
  data.forEach((item, index) => {
    // Check if this is a section header
    if (item._section) {
      // If we have accumulated section data, export it with headers
      if (sectionData.length > 0) {
        addSectionToCSV(csvRows, sectionData)
        sectionData = []
      }

      // Add section header
      currentSection = item._section
      csvRows.push(currentSection)
      return
    }

    // Check if this is a blank row
    if (Object.keys(item).length === 0) {
      // If we have accumulated section data, export it with headers
      if (sectionData.length > 0) {
        addSectionToCSV(csvRows, sectionData)
        sectionData = []
      }

      // Add blank row
      csvRows.push('')
      return
    }

    // Accumulate data for current section
    sectionData.push(item)
  })

  // Export any remaining section data
  if (sectionData.length > 0) {
    addSectionToCSV(csvRows, sectionData)
  }

  const csvContent = csvRows.join('\n')

  // Create and trigger download
  downloadFile(csvContent, `${filename}.csv`, 'text/csv')
}

// Helper function to add a section with its own headers
function addSectionToCSV(csvRows: string[], sectionData: any[]) {
  if (sectionData.length === 0) return

  // Get headers from this section's data
  const headers = new Set<string>()
  sectionData.forEach(item => {
    Object.keys(item).forEach(key => headers.add(key))
  })
  const headerArray = Array.from(headers)

  // Add header row for this section
  csvRows.push(headerArray.join(','))

  // Add data rows for this section
  sectionData.forEach(item => {
    const values = headerArray.map(header => {
      const value = item[header]

      // Handle different data types
      if (value === null || value === undefined) {
        return ''
      }

      // Convert objects/arrays to JSON string
      if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`
      }

      // Escape strings that contain commas, quotes, or newlines
      const stringValue = String(value)
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }

      return stringValue
    })
    csvRows.push(values.join(','))
  })
}

export function exportToJSON(data: any, filename: string) {
  if (!data) {
    console.warn('No data to export')
    return
  }

  const jsonContent = JSON.stringify(data, null, 2)
  downloadFile(jsonContent, `${filename}.json`, 'application/json')
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * Format data for export by flattening nested objects
 */
export function flattenForExport(data: any[]): any[] {
  return data.map(item => {
    const flattened: any = {}

    Object.entries(item).forEach(([key, value]) => {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Flatten nested objects
        Object.entries(value).forEach(([nestedKey, nestedValue]) => {
          flattened[`${key}_${nestedKey}`] = nestedValue
        })
      } else if (Array.isArray(value)) {
        // Convert arrays to comma-separated strings
        flattened[key] = value.map(v =>
          typeof v === 'object' ? JSON.stringify(v) : v
        ).join('; ')
      } else {
        flattened[key] = value
      }
    })

    return flattened
  })
}
