"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "./auth-context"

export interface Task {
  id: string
  userId: string
  title: string
  description: string
  categoryId: string
  frequency: "once" | "daily" | "weekly" | "monthly" | "yearly"
  nextReminder: string
  emailEnabled: boolean
  createdAt: string
  completed: boolean
}

export interface Category {
  id: string
  userId: string
  name: string
  color: string
  icon: string
}

interface TasksContextType {
  tasks: Task[]
  categories: Category[]
  addTask: (task: Omit<Task, "id" | "userId" | "createdAt">) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  addCategory: (category: Omit<Category, "id" | "userId">) => void
  updateCategory: (id: string, updates: Partial<Category>) => void
  deleteCategory: (id: string) => void
  getTasksByCategory: (categoryId: string) => Task[]
}

const TasksContext = createContext<TasksContextType | undefined>(undefined)

const DEFAULT_CATEGORIES: Omit<Category, "id" | "userId">[] = [
  { name: "Home", color: "bg-blue-500", icon: "🏠" },
  { name: "Work", color: "bg-purple-500", icon: "💼" },
  { name: "Personal", color: "bg-green-500", icon: "👤" },
]

export function TasksProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    if (user) {
      // Load tasks
      const storedTasks = localStorage.getItem(`tasks-${user.id}`)
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks))
      }

      // Load or initialize categories
      const storedCategories = localStorage.getItem(`categories-${user.id}`)
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories))
      } else {
        // Initialize with default categories
        const defaultCats = DEFAULT_CATEGORIES.map((cat) => ({
          ...cat,
          id: crypto.randomUUID(),
          userId: user.id,
        }))
        setCategories(defaultCats)
        localStorage.setItem(`categories-${user.id}`, JSON.stringify(defaultCats))
      }
    }
  }, [user])

  const addTask = (task: Omit<Task, "id" | "userId" | "createdAt">) => {
    if (!user) return

    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      userId: user.id,
      createdAt: new Date().toISOString(),
    }

    const updatedTasks = [...tasks, newTask]
    setTasks(updatedTasks)
    localStorage.setItem(`tasks-${user.id}`, JSON.stringify(updatedTasks))
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    if (!user) return

    const updatedTasks = tasks.map((task) => (task.id === id ? { ...task, ...updates } : task))
    setTasks(updatedTasks)
    localStorage.setItem(`tasks-${user.id}`, JSON.stringify(updatedTasks))
  }

  const deleteTask = (id: string) => {
    if (!user) return

    const updatedTasks = tasks.filter((task) => task.id !== id)
    setTasks(updatedTasks)
    localStorage.setItem(`tasks-${user.id}`, JSON.stringify(updatedTasks))
  }

  const addCategory = (category: Omit<Category, "id" | "userId">) => {
    if (!user) return

    const newCategory: Category = {
      ...category,
      id: crypto.randomUUID(),
      userId: user.id,
    }

    const updatedCategories = [...categories, newCategory]
    setCategories(updatedCategories)
    localStorage.setItem(`categories-${user.id}`, JSON.stringify(updatedCategories))
  }

  const updateCategory = (id: string, updates: Partial<Category>) => {
    if (!user) return

    const updatedCategories = categories.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat))
    setCategories(updatedCategories)
    localStorage.setItem(`categories-${user.id}`, JSON.stringify(updatedCategories))
  }

  const deleteCategory = (id: string) => {
    if (!user) return

    // Delete category and all associated tasks
    const updatedCategories = categories.filter((cat) => cat.id !== id)
    const updatedTasks = tasks.filter((task) => task.categoryId !== id)

    setCategories(updatedCategories)
    setTasks(updatedTasks)
    localStorage.setItem(`categories-${user.id}`, JSON.stringify(updatedCategories))
    localStorage.setItem(`tasks-${user.id}`, JSON.stringify(updatedTasks))
  }

  const getTasksByCategory = (categoryId: string) => {
    return tasks.filter((task) => task.categoryId === categoryId)
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
