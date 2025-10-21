"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useTasks } from "@/lib/tasks-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { ManageCategoriesDialog } from "@/components/manage-categories-dialog"
import { TaskCard } from "@/components/task-card"
import { UpcomingReminders } from "@/components/upcoming-reminders"
import { TestReminderButton } from "@/components/test-reminder-button"
import { Bell, Plus, LogOut, Loader2, FolderKanban, Calendar } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function DashboardPage() {
  const { user, logout, isLoading: authLoading } = useAuth()
  const { tasks, categories } = useTasks()
  const router = useRouter()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isCategoriesDialogOpen, setIsCategoriesDialogOpen] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all")
  const [view, setView] = useState<"tasks" | "schedule">("tasks")

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const filteredTasks =
    selectedCategoryId === "all" ? tasks : tasks.filter((task) => task.categoryId === selectedCategoryId)

  const activeTasks = filteredTasks.filter((task) => !task.completed)
  const completedTasks = filteredTasks.filter((task) => task.completed)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Bell className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">Reminder App</h1>
          </div>

          <div className="flex items-center gap-2">
            <TestReminderButton />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {view === "tasks" ? "Your Reminders" : "Reminder Schedule"}
            </h2>
            <p className="text-muted-foreground">
              {view === "tasks"
                ? "Manage your recurring tasks and never miss what matters"
                : "View and manage your upcoming reminders"}
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex gap-1 rounded-lg border p-1">
              <Button
                variant={view === "tasks" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setView("tasks")}
                className="gap-2"
              >
                <Bell className="h-4 w-4" />
                Tasks
              </Button>
              <Button
                variant={view === "schedule" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setView("schedule")}
                className="gap-2"
              >
                <Calendar className="h-4 w-4" />
                Schedule
              </Button>
            </div>
            <Button onClick={() => setIsCategoriesDialogOpen(true)} variant="outline" size="lg">
              <FolderKanban className="mr-2 h-4 w-4" />
              Categories
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)} size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
        </div>

        {view === "schedule" ? (
          <UpcomingReminders />
        ) : (
          <>
            {/* Stats */}
            <div className="mb-8 grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total Reminders</CardDescription>
                  <CardTitle className="text-3xl">{tasks.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Active</CardDescription>
                  <CardTitle className="text-3xl">{activeTasks.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Completed</CardDescription>
                  <CardTitle className="text-3xl">{completedTasks.length}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Category Tabs */}
            <Tabs value={selectedCategoryId} onValueChange={setSelectedCategoryId} className="space-y-6">
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="all">All Tasks</TabsTrigger>
                {categories.map((category) => (
                  <TabsTrigger key={category.id} value={category.id}>
                    <span className="mr-1">{category.icon}</span>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={selectedCategoryId} className="space-y-6">
                {/* Active Tasks */}
                {activeTasks.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Active Tasks</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {activeTasks.map((task) => {
                        const category = categories.find((c) => c.id === task.categoryId)
                        if (!category) return null
                        return <TaskCard key={task.id} task={task} category={category} />
                      })}
                    </div>
                  </div>
                )}

                {/* Completed Tasks */}
                {completedTasks.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Completed Tasks</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {completedTasks.map((task) => {
                        const category = categories.find((c) => c.id === task.categoryId)
                        if (!category) return null
                        return <TaskCard key={task.id} task={task} category={category} />
                      })}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {filteredTasks.length === 0 && (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
                      <h3 className="mb-2 text-lg font-semibold">No reminders yet</h3>
                      <p className="mb-4 text-center text-sm text-muted-foreground">
                        Get started by creating your first reminder
                      </p>
                      <Button onClick={() => setIsAddDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Reminder
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>

      <AddTaskDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
      <ManageCategoriesDialog open={isCategoriesDialogOpen} onOpenChange={setIsCategoriesDialogOpen} />
    </div>
  )
}
