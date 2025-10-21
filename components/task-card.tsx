"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTasks, type Task, type Category } from "@/lib/tasks-context"
import { MoreVertical, Trash2, Mail, MicOff as MailOff, Calendar } from "lucide-react"
import { format } from "date-fns"

interface TaskCardProps {
  task: Task
  category: Category
}

export function TaskCard({ task, category }: TaskCardProps) {
  const { updateTask, deleteTask } = useTasks()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleToggleComplete = () => {
    updateTask(task.id, { completed: !task.completed })
  }

  const handleDelete = () => {
    setIsDeleting(true)
    setTimeout(() => {
      deleteTask(task.id)
    }, 300)
  }

  const handleToggleEmail = () => {
    updateTask(task.id, { emailEnabled: !task.emailEnabled })
  }

  return (
    <Card className={`transition-all ${isDeleting ? "opacity-0 scale-95" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1">
            <Checkbox checked={task.completed} onCheckedChange={handleToggleComplete} className="mt-1" />
            <div className="flex-1 space-y-1">
              <CardTitle className={`text-base ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                {task.title}
              </CardTitle>
              {task.description && <CardDescription className="text-sm">{task.description}</CardDescription>}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleToggleEmail}>
                {task.emailEnabled ? (
                  <>
                    <MailOff className="mr-2 h-4 w-4" />
                    Disable Email
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Enable Email
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="secondary" className={`${category.color} text-white border-0`}>
            {category.icon} {category.name}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Calendar className="h-3 w-3" />
            {task.frequency}
          </Badge>
          {task.emailEnabled && (
            <Badge variant="outline" className="gap-1">
              <Mail className="h-3 w-3" />
              Email
            </Badge>
          )}
          <span className="text-muted-foreground ml-auto">
            Next: {format(new Date(task.nextReminder), "MMM d, yyyy")}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
