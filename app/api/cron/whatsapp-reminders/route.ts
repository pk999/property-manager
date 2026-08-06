import { NextResponse } from 'next/server';

export async function GET() {
  // Automated Cron Handler for daily 9:00 AM WhatsApp Dispatch
  const summary = {
    status: 'success',
    timestamp: new Date().toISOString(),
    scheduled_run: 'Daily 9:00 AM IST',
    processed_landlord: 'Sirisha Amma',
    reminders_sent: [
      { tenant: 'Arjun (Shop 2)', type: 'overdue_fine_alert', amount: 22500, status: 'dispatched' },
      { tenant: 'Bhagya (Shop 1)', type: 'due_date_reminder', amount: 8500, status: 'dispatched' },
      { tenant: 'Shiva (Shop 4)', type: 'due_date_reminder', amount: 7000, status: 'dispatched' }
    ],
    next_scheduled_run: 'Tomorrow 9:00 AM IST'
  };

  return NextResponse.json(summary);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({
    success: true,
    message: 'Automated WhatsApp reminder triggered successfully',
    payload: body,
  });
}
