interface EmailTemplateProps {
  userName: string
  tasks: Array<{
    title: string
    description: string
    category: string
    nextReminder: string
    frequency: string
  }>
}

export function generateReminderEmailHTML({ userName, tasks }: EmailTemplateProps): string {
  const tasksHTML = tasks
    .map(
      (task) => `
    <div style="background-color: white; padding: 15px; margin-bottom: 10px; border-radius: 8px; border: 1px solid #e5e7eb;">
      <h3 style="margin: 0 0 8px 0; color: #111827;">${task.title}</h3>
      ${task.description ? `<p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">${task.description}</p>` : ""}
      <div style="font-size: 12px; color: #9ca3af;">
        <span style="margin-right: 12px;">📁 ${task.category}</span>
        <span style="margin-right: 12px;">🔄 ${task.frequency}</span>
        <span>📅 ${new Date(task.nextReminder).toLocaleString()}</span>
      </div>
    </div>
  `,
    )
    .join("")

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto;">
          <div style="background-color: #0ea5e9; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Task Reminders</h1>
          </div>

          <div style="padding: 20px; background-color: #f9fafb;">
            <p style="font-size: 16px; color: #374151;">Hi ${userName},</p>
            <p style="font-size: 16px; color: #374151;">
              You have ${tasks.length} task${tasks.length !== 1 ? "s" : ""} due soon:
            </p>

            ${tasksHTML}

            <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">Stay on top of your tasks!</p>
          </div>

          <div style="padding: 20px; text-align: center; background-color: #f3f4f6;">
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">
              This is an automated reminder from your Task Reminder App
            </p>
          </div>
        </div>
      </body>
    </html>
  `
}
