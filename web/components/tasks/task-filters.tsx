'use client'

import { Button } from '@consulting-platform/ui'
import { Filter, SortAsc, SortDesc } from 'lucide-react'
import { useState } from 'react'

interface TaskFiltersProps {
  filters: {
    status: 'todo' | 'in_progress' | 'review' | 'completed' | 'all'
    assigneeId?: string
    sortBy: 'dueDate' | 'priority' | 'createdAt' | 'title'
    sortOrder: 'asc' | 'desc'
  }
  setFilters: (filters: any) => void
}

export function TaskFilters({ filters, setFilters }: TaskFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Filter className="h-4 w-4" />
        Filter
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border p-4 z-20">
          <h3 className="font-medium mb-3">Filter & Sort</h3>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                className="w-full mt-1 px-3 py-1 border rounded-lg text-sm"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="all">All</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Sort By</label>
              <select
                className="w-full mt-1 px-3 py-1 border rounded-lg text-sm"
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              >
                <option value="createdAt">Date Created</option>
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="title">Title</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Order</label>
              <div className="flex gap-2 mt-1">
                <button
                  className={`flex-1 px-3 py-1 border rounded-lg text-sm flex items-center justify-center gap-1 ${
                    filters.sortOrder === 'asc' ? 'bg-indigo-50 border-indigo-300' : ''
                  }`}
                  onClick={() => setFilters({ ...filters, sortOrder: 'asc' })}
                >
                  <SortAsc className="h-3 w-3" />
                  Ascending
                </button>
                <button
                  className={`flex-1 px-3 py-1 border rounded-lg text-sm flex items-center justify-center gap-1 ${
                    filters.sortOrder === 'desc' ? 'bg-indigo-50 border-indigo-300' : ''
                  }`}
                  onClick={() => setFilters({ ...filters, sortOrder: 'desc' })}
                >
                  <SortDesc className="h-3 w-3" />
                  Descending
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t">
            <button
              className="text-sm text-indigo-600 hover:text-indigo-700"
              onClick={() => {
                setFilters({
                  status: 'all',
                  assigneeId: undefined,
                  sortBy: 'createdAt',
                  sortOrder: 'desc'
                })
              }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}