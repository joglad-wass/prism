'use client'

import { useState, useRef } from 'react'
import { Deal } from '../../types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { useAttachments, useUploadAttachment, useDeleteAttachment, useDownloadAttachment } from '../../hooks/useAttachments'
import { formatFileSize, downloadBase64File, validateFileSize } from '../../utils/file'
import { Loader2, Upload, FileText, Download, Trash2, AlertCircle, X } from 'lucide-react'
import { toast } from 'sonner'

interface DealAttachmentsProps {
  deal: Deal
}

export function DealAttachments({ deal }: DealAttachmentsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFiles, setSelectedFiles] = useState<Array<{file: File, description: string}>>([])
  const [isUploading, setIsUploading] = useState(false)

  const { data: attachments, isLoading, refetch } = useAttachments(deal.id)
  const uploadMutation = useUploadAttachment()
  const deleteMutation = useDeleteAttachment()
  const downloadMutation = useDownloadAttachment()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const validFiles = Array.from(files).filter(file => {
      if (!validateFileSize(file, 10)) {
        toast.error(`File "${file.name}" exceeds 10MB limit`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    const newFiles = validFiles.map(file => ({
      file,
      description: ''
    }))

    setSelectedFiles([...selectedFiles, ...newFiles])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
  }

  const handleDescriptionChange = (index: number, description: string) => {
    setSelectedFiles(selectedFiles.map((f, i) =>
      i === index ? { ...f, description } : f
    ))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setIsUploading(true)
    try {
      const uploadPromises = selectedFiles.map(({ file, description }) =>
        uploadMutation.mutateAsync({
          file,
          dealId: deal.id,
          description: description.trim() || undefined,
        })
      )

      await Promise.allSettled(uploadPromises)

      toast.success(`${selectedFiles.length} file(s) uploaded successfully`)
      setSelectedFiles([])
      refetch()
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload files')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownload = async (attachmentId: string, fileName: string, fileType: string) => {
    try {
      const result = await downloadMutation.mutateAsync(attachmentId)
      downloadBase64File(result.base64Data, fileName, fileType)
      toast.success('File downloaded')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download file')
    }
  }

  const handleDelete = async (attachmentId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) return

    try {
      await deleteMutation.mutateAsync(attachmentId)
      toast.success('File deleted successfully')
      refetch()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete file')
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Attachments</CardTitle>
          <CardDescription>
            Upload files related to this deal (Max 10MB per file)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <Input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                disabled={isUploading}
                className="hidden"
                id="file-upload"
              />
              <Label
                htmlFor="file-upload"
                className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-muted-foreground/50 hover:bg-accent/50 transition-colors"
              >
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Click to upload or drag and drop
                </span>
              </Label>
            </div>

            {/* File List */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                {selectedFiles.map((selected, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 border rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors"
                  >
                    <FileText className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {selected.file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(selected.file.size)}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 shrink-0"
                          onClick={() => handleRemoveFile(index)}
                          disabled={isUploading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Add description (optional)"
                        value={selected.description}
                        onChange={(e) => handleDescriptionChange(index, e.target.value)}
                        disabled={isUploading}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                ))}

                <Button
                  onClick={handleUpload}
                  disabled={selectedFiles.length === 0 || isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading {selectedFiles.length} file(s)...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload {selectedFiles.length} file(s)
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Attachments List */}
      <Card>
        <CardHeader>
          <CardTitle>Attachments ({attachments?.length || 0})</CardTitle>
          <CardDescription>
            Files attached to this deal
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : attachments && attachments.length > 0 ? (
            <div className="space-y-3">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <FileText className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{attachment.fileName}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{formatFileSize(attachment.fileSize)}</span>
                        <span>•</span>
                        <span>{new Date(attachment.createdAt).toLocaleDateString()}</span>
                        {attachment.uploadedBy && (
                          <>
                            <span>•</span>
                            <span>{attachment.uploadedBy.name}</span>
                          </>
                        )}
                      </div>
                      {attachment.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {attachment.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleDownload(attachment.id, attachment.fileName, attachment.fileType)
                      }
                      disabled={downloadMutation.isPending}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(attachment.id, attachment.fileName)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No attachments yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Upload a file to get started
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
