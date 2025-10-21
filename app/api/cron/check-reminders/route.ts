import { NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@supabase/supabase-js"
import { generateReminderEmailHTML } from "@/lib/email-template"

const resend = new Resend(process.env.RESEND_API_KEY)

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: Request) {
  console.log("[v0] Cron job started at:", new Date().toISOString())

  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.log("[v0] Unauthorized cron job attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!process.env.RESEND_API_KEY) {
      console.log("[v0] RESEND_API_KEY not set")
      return NextResponse.json({ error: "RESEND_API_KEY environment variable is not set" }, { status: 500 })
    }

    const now = new Date().toISOString()
    console.log("[v0] Checking for reminders due before:", now)

    const { data: dueTasks, error: tasksError } = await supabase
      .from("tasks")
      .select(
        `
        *,
        profiles!tasks_user_id_fkey (
          email,
          full_name
        )
      `,
      )
      .lte("next_reminder", now)
      .eq("email_notification", true)
      .eq("completed", false)

    if (tasksError) {
      console.error("[v0] Error querying tasks:", tasksError)
      return NextResponse.json({ error: "Failed to query tasks" }, { status: 500 })
    }

    console.log("[v0] Found", dueTasks?.length || 0, "due tasks")

    if (!dueTasks || dueTasks.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No reminders due",
        timestamp: new Date().toISOString(),
      })
    }

    const tasksByUser = dueTasks.reduce(
      (acc, task) => {
        const userId = task.user_id
        if (!acc[userId]) {
          acc[userId] = {
            email: task.profiles.email,
            name: task.profiles.full_name || "User",
            tasks: [],
          }
        }
        acc[userId].tasks.push(task)
        return acc
      },
      {} as Record<string, { email: string; name: string; tasks: any[] }>,
    )

    let emailsSent = 0
    let tasksUpdated = 0

    for (const [userId, userData] of Object.entries(tasksByUser)) {
      try {
        console.log(`[v0] Sending reminder email to ${userData.email} for ${userData.tasks.length} tasks`)

        // Send email
        const { data: emailData, error: emailError } = await resend.emails.send({
          from: "Task Reminders <onboarding@resend.dev>",
          to: [userData.email],
          subject: `You have ${userData.tasks.length} task${userData.tasks.length !== 1 ? "s" : ""} due`,
          html: generateReminderEmailHTML({
            userName: userData.name,
            tasks: userData.tasks.map((t) => ({
              title: t.title,
              description: t.description,
              nextReminder: t.next_reminder,
            })),
          }),
        })

        if (emailError) {
          console.error(`[v0] Error sending email to ${userData.email}:`, emailError)
        } else {
          console.log(`[v0] Email sent successfully to ${userData.email}:`, emailData?.id)
          emailsSent++

          // Update next reminder dates for each task
          for (const task of userData.tasks) {
            const nextDate = calculateNextReminder(task.next_reminder, task.frequency)
            console.log(`[v0] Updating task ${task.id} next reminder from ${task.next_reminder} to ${nextDate}`)

            const { error: updateError } = await supabase
              .from("tasks")
              .update({ next_reminder: nextDate })
              .eq("id", task.id)

            if (updateError) {
              console.error(`[v0] Error updating task ${task.id}:`, updateError)
            } else {
              tasksUpdated++
            }
          }
        }
      } catch (error) {
        console.error(`[v0] Error processing reminders for user ${userId}:`, error)
      }
    }

    console.log(`[v0] Cron job completed: ${emailsSent} emails sent, ${tasksUpdated} tasks updated`)

    return NextResponse.json({
      success: true,
      message: `Processed ${dueTasks.length} reminders`,
      emailsSent,
      tasksUpdated,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error in cron job:", error)
    return NextResponse.json({ error: "Failed to process reminders" }, { status: 500 })
  }
}

function calculateNextReminder(currentReminder: string, frequency: string): string {
  const current = new Date(currentReminder)

  switch (frequency) {
    case "once":
      // For one-time reminders, set far in the future so they don't trigger again
      return new Date(current.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString()
    case "daily":
      return new Date(current.getTime() + 24 * 60 * 60 * 1000).toISOString()
    case "weekly":
      return new Date(current.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
    case "monthly":
      const nextMonth = new Date(current)
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      return nextMonth.toISOString()
    default:
      return current.toISOString()
  }
}
