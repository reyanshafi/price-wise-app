import { NextResponse } from 'next/server';
import { checkAlerts } from '../../../../scripts/checkPriceAlerts.js';

// This API route will be called by Vercel Cron
export async function GET(request) {
  try {
    // Check for secret token to prevent unauthorized access
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    // Validate secret if provided in environment
    if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('🕒 Starting scheduled price alert check...');
    await checkAlerts();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Price alerts checked successfully' 
    });
  } catch (error) {
    console.error('❌ Error in cron job:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
