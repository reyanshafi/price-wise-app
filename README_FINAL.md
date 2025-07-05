# PriceWise - E-commerce Price Tracking Application

PriceWise is a comprehensive e-commerce price tracking application that helps users monitor product prices across various platforms, get notified about price drops, and make smarter purchasing decisions.

## Features

- **Price Tracking**: Monitor prices of products from Amazon, Flipkart, and other e-commerce platforms
- **Price Alerts**: Set alerts for any target price (higher, lower, or equal to current price)
- **Price History**: View historical price trends to identify patterns
- **Price Predictions**: AI-powered predictions of future price movements
- **Shopping Assistant**: Get recommendations and insights for better purchasing decisions

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS 4
- **Backend**: Next.js API Routes
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Web Scraping**: Puppeteer, Cheerio
- **Email Notifications**: Nodemailer
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase account
- Gmail account for sending notifications

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/price-wise.git
   cd price-wise
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with the following variables:
   ```
   # Firebase
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   # Email (for price alerts)
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=your_app_password
   
   # Optional: OpenAI (for AI insights)
   OPENAI_API_KEY=your_openai_api_key
   
   # Optional: Cron security
   CRON_SECRET=your_secret_token
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Price Alert System

### How It Works

1. **Set Alert**: Users can set price alerts for any product by specifying:
   - Product URL
   - Target price (any value - higher, lower, or equal to current price)
   - Email address for notifications

2. **Alert Processing**:
   - The system periodically checks the current price of tracked products
   - When a price meets the target condition, an email notification is sent
   - The alert is automatically removed after notification

3. **Automation**:
   - In development: Alerts are checked manually using `npm run check-alerts`
   - In production: Alerts are checked automatically using Vercel Cron Jobs

### Automated Alert Checking (Vercel Deployment)

The system is configured to automatically check price alerts every 6 hours using Vercel Cron Jobs:

1. **Cron Configuration**: 
   - Defined in `vercel.json` with the schedule `0 */6 * * *` (every 6 hours)
   - Calls the `/api/cron` endpoint to trigger the alert check process

2. **Required Environment Variables**:
   - `EMAIL_USER`: Gmail address for sending notifications
   - `EMAIL_PASS`: App password for the Gmail account
   - `CRON_SECRET` (optional): Secret token for protecting the cron endpoint

3. **Security**:
   - The cron endpoint is protected using a secret token
   - Only requests with the correct token will be processed
   - Set `CRON_SECRET` in Vercel environment variables and include it in the URL: `/api/cron?secret=your_secret_token`

4. **Manual Trigger**:
   - For testing, you can manually run checks using: `npm run check-alerts`

## Project Structure

- `/src/app`: Next.js app router pages and API routes
- `/src/components`: React components
- `/src/contexts`: React context providers
- `/src/lib`: Utility functions and libraries
  - `/src/lib/firebase.js`: Firebase configuration (backend only)
  - `/src/lib/firebaseClient.js`: Firebase configuration with auth (frontend)
  - `/src/lib/scraper/`: Web scraping modules for different e-commerce sites
- `/scripts`: Server-side scripts for data processing and alert checking
- `/public`: Static assets

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run check-alerts`: Manually trigger price alert check
- `npm run add-sample-data`: Add sample price history data
- `npm run add-real-data`: Add real product data

## Deployment

The application is designed to be deployed on Vercel with the following configuration:

1. Connect your GitHub repository to Vercel
2. Set up environment variables in the Vercel dashboard
3. Deploy the application
4. Vercel will automatically run the cron job for price alerts

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.