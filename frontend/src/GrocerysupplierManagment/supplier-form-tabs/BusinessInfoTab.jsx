import React from 'react'
import { Field, Input, FileUpload } from './Shared'

export default function BusinessInfoTab({ form, setField, files, previews, handleFile, clearFile }) {
  return (
    <div className="space-y-5">
      <Field label="Business Name" required>
        <Input
          value={form.businessName}
          onChange={e => setField('businessName', e.target.value)}
          placeholder="e.g. Green Valley Organics"
          required
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Registration Number">
          <Input
            value={form.registrationNumber}
            onChange={e => setField('registrationNumber', e.target.value)}
            placeholder="Tax / Trade ID"
          />
        </Field>
        <Field label="Year Established">
          <Input
            type="number"
            value={form.yearEstablished}
            onChange={e => setField('yearEstablished', e.target.value)}
            placeholder="YYYY"
            min={1900}
            max={new Date().getFullYear()}
          />
        </Field>
      </div>

      <Field label="Business Type">
        <Input
          value={form.businessType}
          onChange={e => setField('businessType', e.target.value)}
          placeholder="e.g. Sole Proprietor, LLC, Corporation"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <FileUpload
          label="Profile Picture"
          accept="image/*"
          preview={previews.profilePic}
          fileName={files.profilePic?.name}
          onChange={e => handleFile('profilePic', e)}
          onClear={() => clearFile('profilePic')}
        />
        <FileUpload
          label="Business Logo"
          accept="image/*"
          preview={previews.businessLogo}
          fileName={files.businessLogo?.name}
          onChange={e => handleFile('businessLogo', e)}
          onClear={() => clearFile('businessLogo')}
        />
      </div>
    </div>
  )
}