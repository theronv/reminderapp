# Email Reminder Setup Instructions

This app now supports sending actual email reminders! Follow these steps to enable email functionality:

## 1. Get a Resend API Key

1. Go to [resend.com](https://resend.com) and sign up for a free account
2. Navigate to API Keys in your dashboard
3. Create a new API key
4. Copy the API key (it starts with `re_`)

## 2. Add Environment Variable

Add the following environment variable to your Vercel project:

\`\`\`
RESEND_API_KEY=re_your_api_key_here
\`\`\`

You can add this in:
- **Vercel Dashboard**: Project Settings → Environment Variables
- **v0 Interface**: Click "Vars" in the left sidebar

## 3. Set Up Cron Job (Optional)

For automatic reminder emails, set up the cron job:

1. The `vercel.json` file is already configured to run daily at 9 AM UTC
2. Add a `CRON_SECRET` environment variable for security:
   \`\`\`
   CRON_SECRET=your_random_secret_string_here
   \`\`\`
3. Deploy your app to Vercel
4. The cron job will automatically run daily

## 4. Verify Domain (For Production)

For production use, you'll need to verify your domain with Resend:

1. In Resend dashboard, go to Domains
2. Add your domain
3. Add the DNS records provided by Resend
4. Update the `from` field in the API routes to use your domain:
   \`\`\`ts
   from: 'Task Reminders <reminders@yourdomain.com>'
   \`\`\`

## 5. Test the Integration

1. Click the "Test Reminder" button in the dashboard header
2. Check your email inbox (and spam folder)
3. You should receive an email with your upcoming tasks

## Current Limitations

- The app currently uses localStorage for data storage
- The cron job cannot access localStorage data
- For full automated reminders, you'll need to migrate to a database (Supabase is already configured)

## Next Steps for Full Automation

To enable fully automated reminders:

1. Migrate from localStorage to Supabase database
2. Store user data and tasks in the database
3. Update the cron job to query the database for due reminders
4. The cron job will then automatically send emails to users with due tasks
