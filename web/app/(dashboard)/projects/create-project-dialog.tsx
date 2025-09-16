'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { trpc } from '@/app/providers/trpc-provider'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
  Textarea,
} from '@consulting-platform/ui'
import { Loader2, AlertCircle } from 'lucide-react'

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Project name is too long'),
  description: z.string().optional(),
  budget: z.string().optional().transform((val) => {
    if (!val || val === '') return undefined
    const num = parseInt(val, 10)
    return isNaN(num) ? undefined : num
  }),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

type CreateProjectFormData = z.input<typeof createProjectSchema>

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const utils = trpc.useUtils()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
  })

  const createProjectMutation = trpc.projects.create.useMutation({
    onSuccess: async (newProject) => {
      // Invalidate and refetch projects list
      await utils.projects.getAll.invalidate()

      // Reset form
      reset()

      // Close dialog
      onOpenChange(false)

      // Navigate to new project
      router.push(`/dashboard/projects/${newProject.id}`)
    },
    onError: (error) => {
      console.error('Failed to create project:', error)
    },
  })

  const onSubmit = async (data: CreateProjectFormData) => {
    setIsSubmitting(true)

    try {
      // Build timeline object if dates are provided
      let timeline = undefined
      if (data.startDate || data.endDate) {
        timeline = {
          start: data.startDate || null,
          end: data.endDate || null,
        }
      }

      await createProjectMutation.mutateAsync({
        name: data.name,
        description: data.description,
        budget: data.budget as number | undefined,
        timeline,
      })
    } catch (error) {
      // Error is handled in mutation onError
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      reset()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Start a new consulting project. You can add more details later.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Project Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Digital Transformation Initiative"
                {...register('name')}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the project goals and scope..."
                rows={3}
                {...register('description')}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="budget">Budget (USD)</Label>
              <Input
                id="budget"
                type="number"
                placeholder="e.g., 250000"
                {...register('budget')}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register('startDate')}
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register('endDate')}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {createProjectMutation.error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {createProjectMutation.error.message}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}