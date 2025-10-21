"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Category } from "@/lib/tasks-context"

interface CategoryFormProps {
  category?: Category
  onSubmit: (data: { name: string; color: string; icon: string }) => void
  onCancel: () => void
}

const COLOR_OPTIONS = [
  { value: "bg-blue-500", label: "Blue" },
  { value: "bg-purple-500", label: "Purple" },
  { value: "bg-green-500", label: "Green" },
  { value: "bg-red-500", label: "Red" },
  { value: "bg-orange-500", label: "Orange" },
  { value: "bg-pink-500", label: "Pink" },
  { value: "bg-teal-500", label: "Teal" },
  { value: "bg-yellow-500", label: "Yellow" },
]

const ICON_OPTIONS = ["🏠", "💼", "👤", "🎯", "💪", "🎨", "📚", "🛒", "🚗", "✈️", "🏥", "💰", "🎮", "🍔", "🌱", "⚡"]

export function CategoryForm({ category, onSubmit, onCancel }: CategoryFormProps) {
  const [name, setName] = useState(category?.name || "")
  const [color, setColor] = useState(category?.color || "bg-blue-500")
  const [icon, setIcon] = useState(category?.icon || "🏠")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({ name: name.trim(), color, icon })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="category-name">Category Name</Label>
        <Input
          id="category-name"
          placeholder="e.g., Fitness, Shopping"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-3">
        <Label>Color</Label>
        <RadioGroup value={color} onValueChange={setColor} className="grid grid-cols-4 gap-3">
          {COLOR_OPTIONS.map((option) => (
            <div key={option.value}>
              <RadioGroupItem value={option.value} id={option.value} className="peer sr-only" />
              <Label
                htmlFor={option.value}
                className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
              >
                <div className={`h-6 w-6 rounded-full ${option.value}`} />
                <span className="text-xs">{option.label}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label>Icon</Label>
        <RadioGroup value={icon} onValueChange={setIcon} className="grid grid-cols-8 gap-2">
          {ICON_OPTIONS.map((emoji) => (
            <div key={emoji}>
              <RadioGroupItem value={emoji} id={emoji} className="peer sr-only" />
              <Label
                htmlFor={emoji}
                className="flex h-12 w-12 items-center justify-center rounded-md border-2 border-muted bg-popover text-2xl hover:bg-accent peer-data-[state=checked]:border-primary cursor-pointer"
              >
                {emoji}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{category ? "Update" : "Create"} Category</Button>
      </div>
    </form>
  )
}
