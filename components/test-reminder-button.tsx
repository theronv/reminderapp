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

    // Get upcoming reminders (next 24 hours)
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const upcomingTasks = tasks
      .filter((task) => {
        const reminderDate = new Date(task.nextReminder)
        return reminderDate >= now && reminderDate <= tomorrow && task.emailEnabled && !task.completed
      })
      .slice(0, 5)

    try {
      const response = await fetch("/api/send-test-reminder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user?.email,
          userName: user?.name || "User",
          tasks: upcomingTasks.map((task) => ({
            title: task.title,
            description: task.description,
            category: task.category,
            nextReminder: task.nextReminder,
            frequency: task.frequency,
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(
            `Resend Testing Mode: You can only send emails to your verified email address. Please update your profile email or verify a domain at resend.com/domains`,
          )
        }
        throw new Error(data.error || "Failed to send email")
      }

      console.log("[v0] Test reminder sent successfully to:", user?.email)
      console.log("[v0] Upcoming tasks included:", upcomingTasks.length)

      setIsSending(false)
      setSent(true)

      toast({
        title: "Test Reminder Sent!",
        description: `A test email with ${upcomingTasks.length} upcoming reminder(s) has been sent to ${user?.email}`,
      })

      // Reset sent state after 3 seconds
      setTimeout(() => setSent(false), 3000)
    } catch (error) {
      console.error("[v0] Error sending test email:", error)
      setIsSending(false)

      toast({
        title: "Failed to Send Email",
        description: error instanceof Error ? error.message : "Please check your RESEND_API_KEY environment variable.",
        variant: "destructive",
      })
    }
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
