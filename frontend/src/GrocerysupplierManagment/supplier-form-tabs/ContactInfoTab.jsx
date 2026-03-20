import React from 'react'
import { Field, Input } from './Shared'

export default function ContactInfoTab({ form, setField, isEdit }) {
  return (
    <div className="space-y-5">
      <Field label="Contact Person / Owner Name" required>
        <Input
          value={form.contactPersonName}
          onChange={e => setField('contactPersonName', e.target.value)}
          placeholder="Full legal name"
          required
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Email Address" required>
          <Input
            type="email"
            value={form.email}
            onChange={e => setField('email', e.target.value)}
            placeholder="official@business.com"
            disabled={isEdit}
            required
          />
        </Field>
        <Field label="Phone Number" required>
          <Input
            type="tel"
            value={form.phone}
            onChange={e => setField('phone', e.target.value)}
            placeholder="+1 (555) 000-0000"
            required
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="WhatsApp">
          <Input
            type="tel"
            value={form.whatsapp}
            onChange={e => setField('whatsapp', e.target.value)}
            placeholder="Business WhatsApp number"
          />
        </Field>
        <Field label="Website">
          <Input
            type="url"
            value={form.website}
            onChange={e => setField('website', e.target.value)}
            placeholder="https://www.yoursite.com"
          />
        </Field>
      </div>
    </div>
  )
}