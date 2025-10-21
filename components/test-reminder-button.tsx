"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mail, Check } from "lucide-react"
import { useTasks } from "@/lib/tasks-context"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

export function TestReminderButton() {
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)
  const { tasks } = useTasks()
  const { user } = useAuth()
  const { toast } = useToast()

  const handleTestReminder = async () => {
    setIsSending(true)

    // Simulate sending email
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Get upcoming reminders (next 24 hours)
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const upcomingTasks = tasks
      .filter((task) => {
        const reminderDate = new Date(task.nextReminder)
        return reminderDate >= now && reminderDate <= tomorrow && task.emailEnabled && !task.completed
      })
      .slice(0, 3)

    console.log("[v0] Test reminder sent to:", user?.email)
    console.log("[v0] Upcoming tasks included:", upcomingTasks.length)
    console.log(
      "[v0] Task details:",
      upcomingTasks.map((t) => ({ title: t.title, time: new Date(t.nextReminder).toLocaleString() })),
    )

    setIsSending(false)
    setSent(true)

    toast({
      title: "Test Reminder Sent!",
      description: `A test email with ${upcomingTasks.length} upcoming reminder(s) has been sent to ${user?.email}`,
    })

    // Reset sent state after 3 seconds
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <Button
      onClick={handleTestReminder}
      disabled={isSending || sent}
      variant="outline"
      size="sm"
      className="gap-2 bg-transparent"
    >
      {sent ? (
        <>
          <Check className="h-4 w-4" />
          Sent
        </>
      ) : (
        <>
          <Mail className="h-4 w-4" />
          {isSending ? "Sending..." : "Test Reminder"}
        </>
      )}
    </Button>
  )
}
