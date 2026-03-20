import React from 'react'
import { Field, Input } from './Shared'

const PAYMENT_METHODS = [
  { value: 'bank_transfer',   label: 'Bank Transfer',    desc: 'Direct bank-to-bank payment' },
  { value: 'payment_gateway', label: 'Payment Gateway',  desc: 'Online payment processing' },
  { value: 'both',            label: 'Both Methods',     desc: 'Accept either payment method' },
]

export default function BankDetailsTab({ form, setField }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Bank Name">
          <Input
            value={form.bankName}
            onChange={e => setField('bankName', e.target.value)}
            placeholder="e.g. Chase National"
          />
        </Field>
        <Field label="Account Holder Name">
          <Input
            value={form.accountHolderName}
            onChange={e => setField('accountHolderName', e.target.value)}
            placeholder="Legal business or owner name"
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Account Number / IBAN">
          <Input
            className="font-mono"
            value={form.accountNumber}
            onChange={e => setField('accountNumber', e.target.value)}
            placeholder="XXXX-XXXX-XXXX-XXXX"
          />
        </Field>
        <Field label="SWIFT / BIC Code">
          <Input
            className="font-mono"
            value={form.swiftCode}
            onChange={e => setField('swiftCode', e.target.value)}
            placeholder="BANKUS33XXX"
          />
        </Field>
      </div>

      <Field label="Preferred Payment Method">
        <div className="space-y-2 mt-1">
          {PAYMENT_METHODS.map(m => (
            <label
              key={m.value}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                form.paymentMethod === m.value
                  ? 'border-emerald-400 bg-emerald-50'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={m.value}
                checked={form.paymentMethod === m.value}
                onChange={e => setField('paymentMethod', e.target.value)}
                className="accent-emerald-600"
              />
              <div>
                <p className={`text-sm font-medium ${form.paymentMethod === m.value ? 'text-emerald-800' : 'text-slate-700'}`}>
                  {m.label}
                </p>
                <p className="text-xs text-slate-400">{m.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </Field>
    </div>
  )
}