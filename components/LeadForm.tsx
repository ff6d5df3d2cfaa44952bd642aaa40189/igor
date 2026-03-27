'use client';

import { useState } from 'react';
import { LeadPayload } from '@/lib/types';

type Props = {
  hidden: Pick<LeadPayload, 'chat_name' | 'chat_link' | 'catalog_group' | 'region' | 'city_cluster' | 'district'>;
};

const initial = {
  name: '',
  phone: '',
  telegram: '',
  company: '',
  businessType: '',
  comment: '',
};

export function LeadForm({ hidden }: Props) {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('loading');

    const payload: LeadPayload = {
      ...form,
      ...hidden,
    };

    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      setStatus('done');
      setForm(initial);
      return;
    }

    setStatus('error');
  };

  const onChange = (key: keyof typeof initial, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <form className="mt-8 space-y-3 rounded-lg border bg-white p-4" onSubmit={onSubmit}>
      <h3 className="text-lg font-semibold">Оставить заявку</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <input required className="rounded border p-2" placeholder="Имя" value={form.name} onChange={(e) => onChange('name', e.target.value)} />
        <input required className="rounded border p-2" placeholder="Телефон" value={form.phone} onChange={(e) => onChange('phone', e.target.value)} />
        <input className="rounded border p-2" placeholder="Telegram" value={form.telegram} onChange={(e) => onChange('telegram', e.target.value)} />
        <input className="rounded border p-2" placeholder="Компания" value={form.company} onChange={(e) => onChange('company', e.target.value)} />
        <input className="rounded border p-2 md:col-span-2" placeholder="Вид деятельности" value={form.businessType} onChange={(e) => onChange('businessType', e.target.value)} />
      </div>
      <textarea className="min-h-24 w-full rounded border p-2" placeholder="Комментарий" value={form.comment} onChange={(e) => onChange('comment', e.target.value)} />

      <input type="hidden" name="chat_name" value={hidden.chat_name} />
      <input type="hidden" name="chat_link" value={hidden.chat_link} />
      <input type="hidden" name="catalog_group" value={hidden.catalog_group} />
      <input type="hidden" name="region" value={hidden.region} />
      <input type="hidden" name="city_cluster" value={hidden.city_cluster} />
      <input type="hidden" name="district" value={hidden.district} />

      <button disabled={status === 'loading'} className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50" type="submit">
        {status === 'loading' ? 'Отправляем...' : 'Отправить'}
      </button>
      {status === 'done' ? <p className="text-sm text-green-700">Заявка отправлена.</p> : null}
      {status === 'error' ? <p className="text-sm text-red-700">Ошибка отправки, попробуйте позже.</p> : null}
    </form>
  );
}
