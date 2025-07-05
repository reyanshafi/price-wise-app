# Setting Up Vercel Cron Jobs for Price Alerts

This guide walks through the process of setting up automatic price alert checking using Vercel Cron Jobs.

## Prerequisites

1. A Vercel account
2. Your project deployed to Vercel
3. Admin access to your Vercel project

## Steps to Set Up Vercel Cron Jobs

### 1. Configure `vercel.json`

First, ensure your `vercel.json` file has the cron job configuration (already done in this project):

```json
{
  "version": 2,
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

This schedule runs every 6 hours (at 0:00, 6:00, 12:00, and 18:00 UTC).

### 2. Set Up Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to "Settings" > "Environment Variables"
3. Add the following environment variables:
   - `EMAIL_USER`: Your Gmail address for sending notifications
   - `EMAIL_PASS`: Your Gmail app password (not your regular Gmail password)
   - `CRON_SECRET`: A strong random string to secure your cron endpoint

**Important**: For `EMAIL_PASS`, you need an App Password if you have 2FA enabled on your Google account:
1. Go to your Google Account > Security > 2-Step Verification
2. Scroll to the bottom and click on "App passwords"
3. Select "Mail" as the app and "Other" as the device
4. Name it "PriceWise" and copy the generated password

### 3. Deploy Your Project

Ensure your project is deployed to Vercel with the latest changes:

1. Push your changes to your Git repository
2. Vercel should automatically deploy your project
3. If needed, manually trigger a deployment from the Vercel dashboard

### 4. Verify Cron Job Setup

After deployment:

1. Go to your Vercel project dashboard
2. Navigate to "Settings" > "Cron Jobs"
3. You should see your cron job listed with the schedule
4. Check "Logs" to see if the cron job is running as expected

### 5. Test the Cron Endpoint

You can manually test your cron endpoint by visiting:

```
https://your-app-name.vercel.app/api/cron?secret=your-cron-secret
```

Replace `your-app-name` with your Vercel app name and `your-cron-secret` with the secret you set in environment variables.

### 6. Troubleshooting

If your cron job is not running as expected:

1. Check Vercel logs for any errors
2. Ensure all required environment variables are set correctly
3. Verify that your `vercel.json` file is correctly formatted
4. Make sure the `/api/cron` endpoint is working when called manually

### 7. Monitoring

You can monitor your cron job executions:

1. Go to your Vercel project dashboard
2. Navigate to "Logs"
3. Filter logs for "cron" to see cron job execution logs

## Customizing the Schedule

If you want to change how often price alerts are checked, modify the schedule in `vercel.json`. The schedule uses standard cron syntax:

```
* * * * *
┬ ┬ ┬ ┬ ┬
│ │ │ │ │
│ │ │ │ └── day of week (0 - 7, where 0 and 7 are Sunday)
│ │ │ └──── month (1 - 12)
│ │ └────── day of month (1 - 31)
│ └──────── hour (0 - 23)
└────────── minute (0 - 59)
```

Examples:
- `0 */6 * * *`: Every 6 hours (current setting)
- `0 */12 * * *`: Every 12 hours
- `0 0 * * *`: Once a day at midnight
- `0 8,20 * * *`: Twice a day at 8:00 and 20:00
