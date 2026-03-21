import React from 'react'
import { Field, Input } from './Shared'

export default function AddressTab({ form, setField }) {
  return (
    <div className="space-y-5">
      <Field label="Street Address">
        <Input
          value={form.streetAddress}
          onChange={e => setField('streetAddress', e.target.value)}
          placeholder="123 Supply Lane, Industrial Zone"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="City">
          <Input
            value={form.city}
            onChange={e => setField('city', e.target.value)}
            placeholder="e.g. Chicago"
          />
        </Field>
        <Field label="State / Province">
          <Input
            value={form.stateProvince}
            onChange={e => setField('stateProvince', e.target.value)}
            placeholder="e.g. Illinois"
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Postal Code">
          <Input
            value={form.postalCode}
            onChange={e => setField('postalCode', e.target.value)}
            placeholder="60601"
          />
        </Field>
        <Field label="Country">
          <Input
            value={form.country}
            onChange={e => setField('country', e.target.value)}
            placeholder="United States"
          />
        </Field>
      </div>
    </div>
  )
}