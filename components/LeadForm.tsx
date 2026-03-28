'use client';

import { useState } from 'react';
import { LeadPayload } from '@/lib/types';

type Props = {
  hidden: Pick<LeadPayload, 'chat_name' | 'chat_link' | 'catalog_group' | 'region' | 'city_cluster' | 'district'>;
};

const initial = {
  name: '',
  telegram: '',
  businessType: '',
  comment: '',
};

const businessTypeOptions = ['Приёмка квартир', 'Строители', 'Мебельщики', 'Иное'];

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
    <form className="mt-8 space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm" onSubmit={onSubmit}>
      <h3 className="text-lg font-semibold">Оставить заявку на рекламу</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <input required className="rounded-xl border border-slate-200 p-2" placeholder="Имя" value={form.name} onChange={(e) => onChange('name', e.target.value)} />
        <input className="rounded-xl border border-slate-200 p-2" placeholder="Telegram" value={form.telegram} onChange={(e) => onChange('telegram', e.target.value)} />
        <select
          required
          className="rounded-xl border border-slate-200 bg-white p-2 md:col-span-2"
          value={form.businessType}
          onChange={(e) => onChange('businessType', e.target.value)}
        >
          <option value="">Выберите сферу деятельности</option>
          {businessTypeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <textarea
        className="min-h-24 w-full rounded-xl border border-slate-200 p-2"
        placeholder="Комментарий"
        value={form.comment}
        onChange={(e) => onChange('comment', e.target.value)}
      />

      <input type="hidden" name="chat_name" value={hidden.chat_name} />
      <input type="hidden" name="chat_link" value={hidden.chat_link} />
      <input type="hidden" name="catalog_group" value={hidden.catalog_group} />
      <input type="hidden" name="region" value={hidden.region} />
      <input type="hidden" name="city_cluster" value={hidden.city_cluster} />
      <input type="hidden" name="district" value={hidden.district} />

      <button disabled={status === 'loading'} className="btn-primary disabled:opacity-50" type="submit">
        {status === 'loading' ? 'Отправляем...' : 'Отправить заявку'}
      </button>
      {status === 'done' ? <p className="text-sm text-green-700">Заявка отправлена.</p> : null}
      {status === 'error' ? <p className="text-sm text-red-700">Ошибка отправки, попробуйте позже.</p> : null}
    </form>
  );
}
