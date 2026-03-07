import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { suppliersAPI } from '../api/index'
import Layout from '../components/layout/Layout'
import { FormField, Spinner } from '../components/common/index'
import { Upload, X, Plus, Trash2, Building2, Phone, MapPin, Package, FileText, CreditCard, ChevronRight } from 'lucide-react'
import react from 'react'

const SUPPLY_CATEGORIES = ['Fruits','Vegetables','Dairy','Bakery','Meat','Beverages','Frozen','Grains','Spices','Snacks','Seafood','Organic','Herbs','Canned Goods','Condiments']
const UNITS = ['kg','g','ton','liter','piece','box','crate','dozen']
const PAYMENT_METHODS = [
  { value: 'bank_transfer',    label: 'Bank Transfer' },
  { value: 'payment_gateway',  label: 'Payment Gateway' },
  { value: 'both',             label: 'Both Methods' },
]

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
      <Icon size={17} className="text-emerald-700" />
    </div>
    <div>
      <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
      {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
    </div>
  </div>
)

const FileUploadBox = ({ label, required, accept, preview, fileName, onChange, onClear }) => (
  <div>
    <label className="block text-xs font-medium text-slate-600 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {preview ? (
      <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
        {preview.startsWith('data:image') || preview.startsWith('http')
          ? <img src={preview} alt={label} className="w-full h-28 object-cover" />
          : <div className="flex items-center gap-2 p-3"><FileText size={16} className="text-emerald-600 flex-shrink-0" /><span className="text-xs text-slate-600 truncate">{fileName}</span></div>
        }
        <button type="button" onClick={onClear}
          className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
          <X size={12} />
        </button>
      </div>
    ) : (
      <label className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all">
        <Upload size={20} className="text-slate-400" />
        <span className="text-xs text-slate-500 text-center">Click or drag to upload<br/><span className="text-slate-400">{accept || 'PNG, JPG, PDF up to 5MB'}</span></span>
        <input type="file" className="hidden" accept={accept} onChange={onChange} />
      </label>
    )}
  </div>
)

export default function SupplierFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [loading, setLoading]   = useState(isEdit)
  const [saving,  setSaving]    = useState(false)
  const [error,   setError]     = useState('')
  const [activeSection, setActiveSection] = useState(0)

  // ── Form State ───────────────────────────────────────────────────
  const [form, setForm] = useState({
    businessName: '', registrationNumber: '', yearEstablished: '', businessType: '',
    contactPersonName: '', email: '', phone: '', whatsapp: '', website: '',
    streetAddress: '', city: '', stateProvince: '', postalCode: '', country: 'United States',
    bankName: '', accountHolderName: '', accountNumber: '', swiftCode: '',
    paymentMethod: 'both',
  })

  const [supplyCategories, setSupplyCategories] = useState([{ category: 'Fruits', quantity: '', unit: 'kg' }])

  // ── File State (preview + file obj) ─────────────────────────────
  const [files, setFiles] = useState({
    profilePic: null, businessLogo: null,
    businessLicense: null, taxCertificate: null, bankStatement: null,
  })
  const [previews, setPreviews] = useState({
    profilePic: '', businessLogo: '',
    businessLicense: '', taxCertificate: '', bankStatement: '',
  })

  // ── Load existing supplier for edit ─────────────────────────────
  useEffect(() => {
    if (!isEdit) return
    suppliersAPI.getById(id).then(res => {
      const s = res.data.data
      setForm({
        businessName: s.businessName||'', registrationNumber: s.registrationNumber||'',
        yearEstablished: s.yearEstablished||'', businessType: s.businessType||'',
        contactPersonName: s.contactPersonName||'', email: s.email||'',
        phone: s.phone||'', whatsapp: s.whatsapp||'', website: s.website||'',
        streetAddress: s.streetAddress||'', city: s.city||'',
        stateProvince: s.stateProvince||'', postalCode: s.postalCode||'',
        country: s.country||'United States',
        bankName: s.bankName||'', accountHolderName: s.accountHolderName||'',
        accountNumber: s.accountNumber||'', swiftCode: s.swiftCode||'',
        paymentMethod: s.paymentMethod||'both',
      })
      if (s.supplyCategories?.length) setSupplyCategories(s.supplyCategories.map(c => ({ ...c, quantity: String(c.quantity) })))
      setPreviews({
        profilePic: s.profilePic||'', businessLogo: s.businessLogo||'',
        businessLicense: s.businessLicenseFile||'', taxCertificate: s.taxCertificateFile||'',
        bankStatement: s.bankStatementFile||'',
      })
    }).finally(() => setLoading(false))
  }, [id])

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }))

  // ── File handlers ────────────────────────────────────────────────
  const handleFile = (field, e) => {
    const file = e.target.files[0]
    if (!file) return
    setFiles(p => ({ ...p, [field]: file }))
    const reader = new FileReader()
    reader.onload = ev => setPreviews(p => ({ ...p, [field]: ev.target.result }))
    reader.readAsDataURL(file)
  }
  const clearFile = (field) => {
    setFiles(p => ({ ...p, [field]: null }))
    setPreviews(p => ({ ...p, [field]: '' }))
  }

  // ── Supply categories ────────────────────────────────────────────
  const addCategory = () => setSupplyCategories(p => [...p, { category: 'Fruits', quantity: '', unit: 'kg' }])
  const removeCategory = (i) => setSupplyCategories(p => p.filter((_, idx) => idx !== i))
  const updateCategory = (i, k, v) => setSupplyCategories(p => p.map((c, idx) => idx === i ? { ...c, [k]: v } : c))

  // ── Submit ───────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')

    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    fd.append('supplyCategories', JSON.stringify(
      supplyCategories.map(c => ({ ...c, quantity: Number(c.quantity) }))
    ))
    Object.entries(files).forEach(([k, v]) => { if (v) fd.append(k, v) })

    try {
      if (isEdit) await suppliersAPI.update(id, fd)
      else        await suppliersAPI.create(fd)
      navigate('/suppliers')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally { setSaving(false) }
  }

  const SECTIONS = ['Business Info', 'Contact Info', 'Address', 'Supply Categories', 'Documents', 'Bank Details']

  if (loading) return <Layout title={isEdit ? 'Edit Supplier' : 'Add Supplier'}><div className="flex items-center justify-center h-64"><Spinner /></div></Layout>

  return (
    <Layout title={isEdit ? 'Edit Supplier' : 'Add Supplier'} subtitle="Supplier Management">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
            <X size={16} className="flex-shrink-0" /> {error}
          </div>
        )}

        {/* Section nav */}
        <div className="flex items-center gap-2 flex-wrap mb-6">
          {SECTIONS.map((s, i) => (
            <button key={i} type="button" onClick={() => setActiveSection(i)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all ${activeSection === i ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              {i + 1}. {s}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* ── LEFT COLUMN ────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Business Info */}
            <div className="card p-6">
              <SectionHeader icon={Building2} title="Business Information" subtitle="Legal identity and establishment details." />
              <div className="space-y-4">
                <FormField label="Business Name" required>
                  <input className="input" value={form.businessName} onChange={e => setField('businessName', e.target.value)} required placeholder="e.g. Green Valley Organics" />
                </FormField>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Registration Number">
                    <input className="input" value={form.registrationNumber} onChange={e => setField('registrationNumber', e.target.value)} placeholder="Tax / Trade ID" />
                  </FormField>
                  <FormField label="Year Established">
                    <input className="input" type="number" value={form.yearEstablished} onChange={e => setField('yearEstablished', e.target.value)} placeholder="YYYY" min={1900} max={new Date().getFullYear()} />
                  </FormField>
                </div>
                <FormField label="Business Type">
                  <input className="input" value={form.businessType} onChange={e => setField('businessType', e.target.value)} placeholder="e.g. Sole Proprietor, LLC, Corporation" />
                </FormField>
                <div className="grid grid-cols-2 gap-3">
                  <FileUploadBox label="Profile Picture" accept="image/*"
                    preview={previews.profilePic} fileName={files.profilePic?.name}
                    onChange={e => handleFile('profilePic', e)} onClear={() => clearFile('profilePic')} />
                  <FileUploadBox label="Business Logo" accept="image/*"
                    preview={previews.businessLogo} fileName={files.businessLogo?.name}
                    onChange={e => handleFile('businessLogo', e)} onClear={() => clearFile('businessLogo')} />
                </div>
              </div>
            </div>

            {/* Supply Categories */}
            <div className="card p-6">
              <SectionHeader icon={Package} title="Supply Categories" subtitle="Select product types and quantities." />
              <div className="space-y-3">
                {supplyCategories.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <select className="input flex-1" value={c.category} onChange={e => updateCategory(i, 'category', e.target.value)}>
                      {SUPPLY_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <input type="number" className="input w-24" value={c.quantity} onChange={e => updateCategory(i, 'quantity', e.target.value)}
                      placeholder="Qty" min={0} required />
                    <select className="input w-20" value={c.unit} onChange={e => updateCategory(i, 'unit', e.target.value)}>
                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                    {supplyCategories.length > 1 && (
                      <button type="button" onClick={() => removeCategory(i)} className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-50 rounded-lg flex-shrink-0">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addCategory}
                  className="w-full border-2 border-dashed border-slate-200 rounded-xl py-2 text-xs text-slate-500 hover:border-emerald-400 hover:text-emerald-600 flex items-center justify-center gap-1 transition-colors">
                  <Plus size={14} /> Add Category
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2">Selected categories determine which procurement requests you receive.</p>
            </div>

            {/* Compliance Documents */}
            <div className="card p-6">
              <SectionHeader icon={FileText} title="Compliance & Documents" subtitle="Official documentation required for verification." />
              <div className="space-y-4">
                <FileUploadBox label="Business License" required accept=".pdf,.jpg,.jpeg,.png"
                  preview={previews.businessLicense} fileName={files.businessLicense?.name}
                  onChange={e => handleFile('businessLicense', e)} onClear={() => clearFile('businessLicense')} />
                <FileUploadBox label="Tax Certificate" required accept=".pdf,.jpg,.jpeg,.png"
                  preview={previews.taxCertificate} fileName={files.taxCertificate?.name}
                  onChange={e => handleFile('taxCertificate', e)} onClear={() => clearFile('taxCertificate')} />
                <FileUploadBox label="Bank Statement / Proof" required accept=".pdf,.jpg,.jpeg,.png"
                  preview={previews.bankStatement} fileName={files.bankStatement?.name}
                  onChange={e => handleFile('bankStatement', e)} onClear={() => clearFile('bankStatement')} />
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ───────────────────────────────────── */}
          <div className="space-y-5">

            {/* Contact Info */}
            <div className="card p-6">
              <SectionHeader icon={Phone} title="Contact Information" subtitle="Who should we reach out to for orders?" />
              <div className="space-y-4">
                <FormField label="Contact Person / Owner Name" required>
                  <input className="input" value={form.contactPersonName} onChange={e => setField('contactPersonName', e.target.value)} required placeholder="Full legal name" />
                </FormField>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Email Address" required>
                    <input className="input" type="email" value={form.email} onChange={e => setField('email', e.target.value)} required placeholder="official@business.com" disabled={isEdit} />
                  </FormField>
                  <FormField label="Phone Number" required>
                    <input className="input" type="tel" value={form.phone} onChange={e => setField('phone', e.target.value)} required placeholder="+1 (555) 000-0000" />
                  </FormField>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="WhatsApp (Optional)">
                    <input className="input" type="tel" value={form.whatsapp} onChange={e => setField('whatsapp', e.target.value)} placeholder="Verified business number" />
                  </FormField>
                  <FormField label="Website (Optional)">
                    <input className="input" type="url" value={form.website} onChange={e => setField('website', e.target.value)} placeholder="https://www.yoursite.com" />
                  </FormField>
                </div>
              </div>
            </div>

            {/* Warehouse Address */}
            <div className="card p-6">
              <SectionHeader icon={MapPin} title="Warehouse / Office Address" subtitle="Primary location for pickups and delivery." />
              <div className="space-y-4">
                <FormField label="Street Address">
                  <input className="input" value={form.streetAddress} onChange={e => setField('streetAddress', e.target.value)} placeholder="123 Supply Lane, Industrial Zone" />
                </FormField>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="City">
                    <input className="input" value={form.city} onChange={e => setField('city', e.target.value)} placeholder="e.g. Chicago" />
                  </FormField>
                  <FormField label="State / Province">
                    <input className="input" value={form.stateProvince} onChange={e => setField('stateProvince', e.target.value)} placeholder="e.g. Illinois" />
                  </FormField>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Postal Code">
                    <input className="input" value={form.postalCode} onChange={e => setField('postalCode', e.target.value)} placeholder="60601" />
                  </FormField>
                  <FormField label="Country">
                    <input className="input" value={form.country} onChange={e => setField('country', e.target.value)} placeholder="United States" />
                  </FormField>
                </div>
              </div>
            </div>

            {/* Bank Account Details */}
            <div className="card p-6">
              <SectionHeader icon={CreditCard} title="Bank Account Details" subtitle="Payment disbursement information." />
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Bank Name">
                    <input className="input" value={form.bankName} onChange={e => setField('bankName', e.target.value)} placeholder="e.g. Chase National" />
                  </FormField>
                  <FormField label="Account Holder Name">
                    <input className="input" value={form.accountHolderName} onChange={e => setField('accountHolderName', e.target.value)} placeholder="Legal business or owner name" />
                  </FormField>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Account Number / IBAN">
                    <input className="input font-mono" value={form.accountNumber} onChange={e => setField('accountNumber', e.target.value)} placeholder="XXXX-XXXX-XXXX-XXXX" />
                  </FormField>
                  <FormField label="SWIFT / BIC Code">
                    <input className="input font-mono" value={form.swiftCode} onChange={e => setField('swiftCode', e.target.value)} placeholder="BANKUS33XXX" />
                  </FormField>
                </div>
                <FormField label="Payment Method">
                  <div className="space-y-2">
                    {PAYMENT_METHODS.map(m => (
                      <label key={m.value} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${form.paymentMethod === m.value ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                        <input type="radio" name="paymentMethod" value={m.value} checked={form.paymentMethod === m.value}
                          onChange={e => setField('paymentMethod', e.target.value)} className="accent-emerald-600" />
                        <span className={`text-sm font-medium ${form.paymentMethod === m.value ? 'text-emerald-800' : 'text-slate-700'}`}>{m.label}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">We process payments every Tuesday and Friday according to your net-15 terms.</p>
                </FormField>
              </div>
            </div>
          </div>
        </div>

        {/* ── Submit ─────────────────────────────────────────── */}
        <div className="mt-6 flex items-center justify-between card p-4">
          <button type="button" onClick={() => navigate('/suppliers')} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary px-8">
            {saving ? <><Spinner size="sm" /> Saving...</> : isEdit ? 'Save Changes' : 'Send for Approval →'}
          </button>
        </div>
      </form>
    </Layout>
  )
}