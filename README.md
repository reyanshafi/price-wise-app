This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Price Alert Automation

This application includes an automated price alert system that runs on a scheduled basis:

### How It Works

1. **Alert Setup**: Users set price alerts through the application UI
2. **Scheduled Checks**: The system automatically checks product prices against the user's target prices every 6 hours
3. **Notification**: When a target price is reached, the system sends an email notification to the user

### Vercel Deployment Configuration

The price alert automation is implemented using Vercel Cron Jobs:

1. **API Route**: `/api/cron` handles the scheduled price checks
2. **Cron Schedule**: Configured in `vercel.json` to run every 6 hours
3. **Environment Variables**: Make sure to set these in your Vercel project settings:
   - `EMAIL_USER`: The email address used to send notifications
   - `EMAIL_PASS`: App password for the email account (use app-specific password if 2FA is enabled)
   - `CRON_SECRET` (optional): A secret token to protect the cron endpoint

### Manual Trigger

You can manually trigger the price alert check locally using:

```bash
npm run check-alerts
```

### Security

To secure your cron endpoint from unauthorized access, set a `CRON_SECRET` environment variable in Vercel and include it when calling the endpoint:

```
https://your-app.vercel.app/api/cron?secret=your-secret-token
```
