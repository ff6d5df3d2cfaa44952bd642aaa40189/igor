import { LeadPayload } from './types';

export async function forwardLeadToIntegrations(lead: LeadPayload): Promise<void> {
  // Integration point for Telegram webhook / email.
  // Example:
  // await fetch(process.env.TELEGRAM_WEBHOOK_URL!, { method: 'POST', body: JSON.stringify(lead) });
  // await sendEmail(lead);
  void lead;
}
