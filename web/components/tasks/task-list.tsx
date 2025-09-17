"use client";

import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@consulting-platform/ui";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Edit2,
  MoreVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { trpc as api } from "@/app/providers/trpc-provider";
import { TaskFilters } from "./task-filters";
import { TaskForm } from "./task-form";

interface TaskListProps {
  projectId: string;
}

export function TaskList({ projectId }: TaskListProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [filters, setFilters] = useState({
    status: "all" as "todo" | "in-progress" | "review" | "completed" | "all",
    assigneeId: undefined as string | undefined,
    sortBy: "createdAt" as "dueDate" | "priority" | "createdAt" | "title",
    sortOrder: "desc" as "asc" | "desc",
  });

  const { data: tasks, refetch } = api.tasks.getByProject.useQuery({
    projectId,
    ...filters,
  });

  const { data: stats } = api.tasks.getStats.useQuery(projectId);

  const updateStatus = api.tasks.updateStatus.useMutation({
    onSuccess: () => refetch(),
  });

  const deleteTask = api.tasks.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "review":
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "review":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Task Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-sm text-gray-600">Total Tasks</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.byStatus.completed}</div>
              <p className="text-sm text-gray-600">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.byStatus.in_progress}</div>
              <p className="text-sm text-gray-600">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.completionRate}%</div>
              <p className="text-sm text-gray-600">Completion Rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Task Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Tasks</h2>
        <div className="flex gap-2">
          <TaskFilters filters={filters} setFilters={setFilters} />
          <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Create Task Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Task</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskForm
              projectId={projectId}
              onSuccess={() => {
                setIsCreating(false);
                refetch();
              }}
              onCancel={() => setIsCreating(false)}
            />
          </CardContent>
        </Card>
      )}

      {/* Edit Task Form */}
      {editingTask && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Task</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskForm
              projectId={projectId}
              task={editingTask}
              onSuccess={() => {
                setEditingTask(null);
                refetch();
              }}
              onCancel={() => setEditingTask(null)}
            />
          </CardContent>
        </Card>
      )}

      {/* Task List */}
      <div className="space-y-3">
        {tasks?.map((task: any) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <button
                  onClick={() =>
                    updateStatus.mutate({
                      id: task.id,
                      status: task.status === "completed" ? "todo" : "completed",
                    })
                  }
                  className="mt-1"
                >
                  {getStatusIcon(task.status)}
                </button>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3
                        className={`font-medium ${task.status === "completed" ? "line-through text-gray-500" : ""}`}
                      >
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      )}

                      <div className="flex items-center gap-4 mt-2">
                        {task.assignee && (
                          <div className="flex items-center gap-1">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-xs font-medium text-indigo-600">
                                {task.assignee.firstName?.[0]}
                                {task.assignee.lastName?.[0]}
                              </span>
                            </div>
                            <span className="text-sm text-gray-600">
                              {task.assignee.firstName} {task.assignee.lastName}
                            </span>
                          </div>
                        )}

                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="h-3 w-3" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}

                        {task.estimatedHours && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock className="h-3 w-3" />
                            {task.estimatedHours}h
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace("_", " ")}
                      </Badge>

                      <div className="relative group">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border hidden group-hover:block z-10">
                          <button
                            onClick={() => setEditingTask(task)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Edit2 className="h-3 w-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this task?")) {
                                deleteTask.mutate(task.id);
                              }
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {task.tags && task.tags.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {(task.tags as string[]).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {tasks?.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">
                No tasks found. Create your first task to get started!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
