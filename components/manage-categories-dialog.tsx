"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CategoryForm } from "@/components/category-form"
import { useTasks, type Category } from "@/lib/tasks-context"
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ManageCategoriesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ManageCategoriesDialog({ open, onOpenChange }: ManageCategoriesDialogProps) {
  const { categories, addCategory, updateCategory, deleteCategory, getTasksByCategory } = useTasks()
  const [mode, setMode] = useState<"list" | "add" | "edit">("list")
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)

  const handleAddCategory = (data: { name: string; color: string; icon: string }) => {
    addCategory(data)
    setMode("list")
  }

  const handleEditCategory = (data: { name: string; color: string; icon: string }) => {
    if (editingCategory) {
      updateCategory(editingCategory.id, data)
      setEditingCategory(null)
      setMode("list")
    }
  }

  const handleDeleteCategory = () => {
    if (deletingCategory) {
      deleteCategory(deletingCategory.id)
      setDeletingCategory(null)
    }
  }

  const startEdit = (category: Category) => {
    setEditingCategory(category)
    setMode("edit")
  }

  const cancelForm = () => {
    setMode("list")
    setEditingCategory(null)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {mode === "list" ? "Manage Categories" : mode === "add" ? "Add Category" : "Edit Category"}
            </DialogTitle>
            <DialogDescription>
              {mode === "list"
                ? "Create custom categories to organize your reminders"
                : "Choose a name, color, and icon for your category"}
            </DialogDescription>
          </DialogHeader>

          {mode === "list" && (
            <div className="space-y-4">
              <Button onClick={() => setMode("add")} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add New Category
              </Button>

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {categories.map((category) => {
                  const taskCount = getTasksByCategory(category.id).length
                  return (
                    <Card key={category.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${category.color}`}>
                            <span className="text-xl">{category.icon}</span>
                          </div>
                          <div>
                            <p className="font-medium">{category.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {taskCount} {taskCount === 1 ? "task" : "tasks"}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => startEdit(category)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingCategory(category)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {mode === "add" && <CategoryForm onSubmit={handleAddCategory} onCancel={cancelForm} />}

          {mode === "edit" && editingCategory && (
            <CategoryForm category={editingCategory} onSubmit={handleEditCategory} onCancel={cancelForm} />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Category?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deletingCategory && (
                <>
                  Are you sure you want to delete <strong>{deletingCategory.name}</strong>? This will also delete all{" "}
                  {getTasksByCategory(deletingCategory.id).length} associated tasks. This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
