import { NextResponse } from "next/server"
import { Resend } from "resend"
import { generateReminderEmailHTML } from "@/lib/email-template"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { email, userName, tasks } = await request.json()

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "RESEND_API_KEY environment variable is not set. Please add it to your project." },
        { status: 500 },
      )
    }

    console.log("[v0] Attempting to send test email to:", email)

    const { data, error } = await resend.emails.send({
      from: "Task Reminders <onboarding@resend.dev>",
      to: [email],
      subject: `Test Reminder - You have ${tasks.length} upcoming task${tasks.length !== 1 ? "s" : ""}`,
      html: generateReminderEmailHTML({ userName, tasks }),
    })

    if (error) {
      console.error("[v0] Error sending test email:", error)

      if (error.message?.includes("only send testing emails to your own email")) {
        return NextResponse.json(
          {
            error:
              "Resend is in testing mode. Please use your verified email address in your profile, or verify a domain at resend.com/domains to send to any email.",
            details: error.message,
          },
          { status: 403 },
        )
      }

      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Test email sent successfully:", data)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Error in send-test-reminder:", error)
    return NextResponse.json({ error: "Failed to send test email" }, { status: 500 })
  }
}
