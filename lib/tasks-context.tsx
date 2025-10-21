"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "./auth-context"
import { createClient } from "@/lib/supabase/client"

export interface Task {
  id: string
  user_id: string
  title: string
  description: string
  category_id: string
  frequency: "once" | "daily" | "weekly" | "monthly"
  next_reminder: string
  email_notification: boolean
  completed: boolean
  created_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  color: string
  icon: string
}

interface TasksContextType {
  tasks: Task[]
  categories: Category[]
  addTask: (task: Omit<Task, "id" | "user_id" | "created_at">) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  addCategory: (category: Omit<Category, "id" | "user_id">) => Promise<void>
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  getTasksByCategory: (categoryId: string) => Task[]
  isLoading: boolean
}

const TasksContext = createContext<TasksContextType | undefined>(undefined)

export function TasksProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      loadData()
    } else {
      setTasks([])
      setCategories([])
      setIsLoading(false)
    }
  }, [user])

  const loadData = async () => {
    if (!user) return

    setIsLoading(true)

    // Load categories
    const { data: categoriesData, error: categoriesError } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })

    if (categoriesError) {
      console.error("[v0] Error loading categories:", categoriesError)
    } else {
      setCategories(categoriesData || [])
    }

    // Load tasks
    const { data: tasksData, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (tasksError) {
      console.error("[v0] Error loading tasks:", tasksError)
    } else {
      setTasks(tasksData || [])
    }

    setIsLoading(false)
  }

  const addTask = async (task: Omit<Task, "id" | "user_id" | "created_at">) => {
    if (!user) return

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: user.id,
        title: task.title,
        description: task.description,
        category_id: task.category_id,
        frequency: task.frequency,
        next_reminder: task.next_reminder,
        email_notification: task.email_notification,
        completed: task.completed,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error adding task:", error)
    } else {
      setTasks([data, ...tasks])
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!user) return

    const { error } = await supabase.from("tasks").update(updates).eq("id", id).eq("user_id", user.id)

    if (error) {
      console.error("[v0] Error updating task:", error)
    } else {
      setTasks(tasks.map((task) => (task.id === id ? { ...task, ...updates } : task)))
    }
  }

  const deleteTask = async (id: string) => {
    if (!user) return

    const { error } = await supabase.from("tasks").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
      console.error("[v0] Error deleting task:", error)
    } else {
      setTasks(tasks.filter((task) => task.id !== id))
    }
  }

  const addCategory = async (category: Omit<Category, "id" | "user_id">) => {
    if (!user) return

    const { data, error } = await supabase
      .from("categories")
      .insert({
        user_id: user.id,
        name: category.name,
        color: category.color,
        icon: category.icon,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error adding category:", error)
    } else {
      setCategories([...categories, data])
    }
  }

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    if (!user) return

    const { error } = await supabase.from("categories").update(updates).eq("id", id).eq("user_id", user.id)

    if (error) {
      console.error("[v0] Error updating category:", error)
    } else {
      setCategories(categories.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat)))
    }
  }

  const deleteCategory = async (id: string) => {
    if (!user) return

    // Delete category (tasks will be set to null due to on delete set null)
    const { error } = await supabase.from("categories").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
      console.error("[v0] Error deleting category:", error)
    } else {
      setCategories(categories.filter((cat) => cat.id !== id))
      // Update local tasks to reflect category removal
      setTasks(tasks.map((task) => (task.category_id === id ? { ...task, category_id: "" } : task)))
    }
  }

  const getTasksByCategory = (categoryId: string) => {
    return tasks.filter((task) => task.category_id === categoryId)
  }

  return (
    <TasksContext.Provider
      value={{
        tasks,
        categories,
        addTask,
        updateTask,
        deleteTask,
        addCategory,
        updateCategory,
        deleteCategory,
        getTasksByCategory,
        isLoading,
      }}
    >
      {children}
    </TasksContext.Provider>
  )
}

export function useTasks() {
  const context = useContext(TasksContext)
  if (context === undefined) {
    throw new Error("useTasks must be used within a TasksProvider")
  }
  return context
}
