import React from 'react'
import { FileUpload } from './Shared'

export default function DocumentsTab({ files, previews, handleFile, clearFile }) {
  return (
    <div className="space-y-5">
      <p className="text-xs text-slate-400">
        Upload official documentation required for supplier verification. Accepted formats: PDF, JPG, PNG.
      </p>

      <FileUpload
        label="Business License"
        required
        accept=".pdf,.jpg,.jpeg,.png"
        preview={previews.businessLicense}
        fileName={files.businessLicense?.name}
        onChange={e => handleFile('businessLicense', e)}
        onClear={() => clearFile('businessLicense')}
      />

      <FileUpload
        label="Tax Certificate"
        required
        accept=".pdf,.jpg,.jpeg,.png"
        preview={previews.taxCertificate}
        fileName={files.taxCertificate?.name}
        onChange={e => handleFile('taxCertificate', e)}
        onClear={() => clearFile('taxCertificate')}
      />

      <FileUpload
        label="Bank Statement / Proof of Account"
        required
        accept=".pdf,.jpg,.jpeg,.png"
        preview={previews.bankStatement}
        fileName={files.bankStatement?.name}
        onChange={e => handleFile('bankStatement', e)}
        onClear={() => clearFile('bankStatement')}
      />
    </div>
  )
}