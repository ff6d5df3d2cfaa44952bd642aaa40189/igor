import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { forwardLeadToIntegrations } from '@/lib/integrations';

const leadSchema = z.object({
  name: z.string().min(1),
  telegram: z.string().optional().default(''),
  businessType: z.string().optional().default(''),
  comment: z.string().optional().default(''),
  chat_name: z.string().min(1),
  chat_link: z.string().url(),
  catalog_group: z.string().min(1),
  region: z.string().min(1),
  city_cluster: z.string().min(1),
  district: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = leadSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Некорректные данные' }, { status: 400 });
  }

  const lead = {
    ...parsed.data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  const storagePath = path.join(process.cwd(), 'data', 'leads.json');
  const current = JSON.parse(await fs.readFile(storagePath, 'utf-8')) as unknown[];
  current.push(lead);
  await fs.writeFile(storagePath, JSON.stringify(current, null, 2), 'utf-8');

  await forwardLeadToIntegrations(parsed.data);

  return NextResponse.json({ ok: true });
}
