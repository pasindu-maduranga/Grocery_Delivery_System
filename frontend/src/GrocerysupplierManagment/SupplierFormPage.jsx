import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { suppliersAPI } from '../api/index'
import Layout from '../components/layout/Layout'
import { Spinner } from '../components/common/index'
import { Building2, Phone, MapPin, Package, FileText, CreditCard, ChevronRight, ChevronLeft, X } from 'lucide-react'

import BusinessInfoTab      from './supplier-form-tabs/BusinessInfoTab'
import ContactInfoTab       from './supplier-form-tabs/ContactInfoTab'
import AddressTab           from './supplier-form-tabs/AddressTab'
import SupplyCategoriesTab  from './supplier-form-tabs/SupplyCategoriesTab'
import DocumentsTab         from './supplier-form-tabs/DocumentsTab'
import BankDetailsTab       from './supplier-form-tabs/BankDetailsTab'

const TABS = [
  { label: 'Business Info',     icon: Building2  },
  { label: 'Contact Info',      icon: Phone      },
  { label: 'Address',           icon: MapPin     },
  { label: 'Supply Categories', icon: Package    },
  { label: 'Documents',         icon: FileText   },
  { label: 'Bank Details',      icon: CreditCard },
]

const EMPTY_FORM = {
  businessName: '', registrationNumber: '', yearEstablished: '', businessType: '',
  contactPersonName: '', email: '', phone: '', whatsapp: '', website: '',
  streetAddress: '', city: '', stateProvince: '', postalCode: '', country: 'United States',
  bankName: '', accountHolderName: '', accountNumber: '', swiftCode: '', paymentMethod: 'both',
}

const EMPTY_FILES    = { profilePic: null, businessLogo: null, businessLicense: null, taxCertificate: null, bankStatement: null }
const EMPTY_PREVIEWS = { profilePic: '',   businessLogo: '',   businessLicense: '',   taxCertificate: '',   bankStatement: ''   }

export default function SupplierFormPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const isEdit   = Boolean(id)

  const [tab,        setTab]        = useState(0)
  const [loading,    setLoading]    = useState(isEdit)
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [categories, setCategories] = useState([{ category: 'Fruits', quantity: '', unit: 'kg' }])
  const [files,      setFiles]      = useState(EMPTY_FILES)
  const [previews,   setPreviews]   = useState(EMPTY_PREVIEWS)

  useEffect(() => {
    if (!isEdit) return
    suppliersAPI.getById(id)
      .then(res => {
        const s = res.data.data
        setForm({
          businessName: s.businessName ?? '', registrationNumber: s.registrationNumber ?? '',
          yearEstablished: s.yearEstablished ?? '', businessType: s.businessType ?? '',
          contactPersonName: s.contactPersonName ?? '', email: s.email ?? '',
          phone: s.phone ?? '', whatsapp: s.whatsapp ?? '', website: s.website ?? '',
          streetAddress: s.streetAddress ?? '', city: s.city ?? '',
          stateProvince: s.stateProvince ?? '', postalCode: s.postalCode ?? '',
          country: s.country ?? 'United States',
          bankName: s.bankName ?? '', accountHolderName: s.accountHolderName ?? '',
          accountNumber: s.accountNumber ?? '', swiftCode: s.swiftCode ?? '',
          paymentMethod: s.paymentMethod ?? 'both',
        })
        if (s.supplyCategories?.length)
          setCategories(s.supplyCategories.map(c => ({ ...c, quantity: String(c.quantity) })))
        setPreviews({
          profilePic:      s.profilePic          ?? '',
          businessLogo:    s.businessLogo        ?? '',
          businessLicense: s.businessLicenseFile ?? '',
          taxCertificate:  s.taxCertificateFile  ?? '',
          bankStatement:   s.bankStatementFile   ?? '',
        })
      })
      .finally(() => setLoading(false))
  }, [id])

  const setField = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const handleFile = (field, e) => {
    const file = e.target.files[0]
    if (!file) return
    setFiles(prev => ({ ...prev, [field]: file }))
    const reader = new FileReader()
    reader.onload = ev => setPreviews(prev => ({ ...prev, [field]: ev.target.result }))
    reader.readAsDataURL(file)
  }

  const clearFile      = (field) => { setFiles(p => ({ ...p, [field]: null })); setPreviews(p => ({ ...p, [field]: '' })) }
  const addCategory    = () => setCategories(prev => [...prev, { category: 'Fruits', quantity: '', unit: 'kg' }])
  const removeCategory = (i) => setCategories(prev => prev.filter((_, idx) => idx !== i))
  const updateCategory = (i, key, val) => setCategories(prev => prev.map((c, idx) => idx === i ? { ...c, [key]: val } : c))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    fd.append('supplyCategories', JSON.stringify(categories.map(c => ({ ...c, quantity: Number(c.quantity) }))))
    Object.entries(files).forEach(([k, v]) => { if (v) fd.append(k, v) })
    try {
      if (isEdit) await suppliersAPI.update(id, fd)
      else        await suppliersAPI.create(fd)
      navigate('/suppliers')
    } catch (err) {
      setError(err.response?.data?.message ?? 'Something went wrong')
      setTab(0)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <Layout title={isEdit ? 'Edit Supplier' : 'Add Supplier'}>
      <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
    </Layout>
  )

  return (
    <Layout title={isEdit ? 'Edit Supplier' : 'Add Supplier'} subtitle="Supplier Management">
      <form onSubmit={handleSubmit}>
        <div className="max-w-2xl mx-auto">

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
            <X size={15} className="flex-shrink-0" /> <span>{error}</span>
          </div>
        )}

        {/* Tab Bar */}
        <div className="grid grid-cols-6 bg-slate-100 rounded p-1 mb-6">
          {TABS.map((t, i) => {
            const Icon = t.icon
            return (
              <button
                key={i}
                type="button"
                onClick={() => setTab(i)}
                className={`flex items-center gap-1.5 px-2 py-2 rounded-sm text-xs font-semibold transition-all justify-center ${
                  tab === i
                    ? 'bg-white text-emerald-700 shadow-sm rounded-sm'
                    : i < tab
                    ? 'text-emerald-600 hover:bg-white/60'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-white/60'
                }`}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{t.label}</span>
                {i < tab && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="card p-6 mb-5 min-h-80 rounded-none border-x-0 shadow-none border-slate-100">
          <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
            {(() => { const Icon = TABS[tab].icon; return <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center"><Icon size={16} className="text-emerald-700" /></div> })()}
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">{TABS[tab].label}</h3>
              <p className="text-xs text-slate-400">Step {tab + 1} of {TABS.length}</p>
            </div>
          </div>

          {tab === 0 && <BusinessInfoTab     form={form} setField={setField} files={files} previews={previews} handleFile={handleFile} clearFile={clearFile} />}
          {tab === 1 && <ContactInfoTab      form={form} setField={setField} isEdit={isEdit} />}
          {tab === 2 && <AddressTab          form={form} setField={setField} />}
          {tab === 3 && <SupplyCategoriesTab categories={categories} addCategory={addCategory} updateCategory={updateCategory} removeCategory={removeCategory} />}
          {tab === 4 && <DocumentsTab        files={files} previews={previews} handleFile={handleFile} clearFile={clearFile} />}
          {tab === 5 && <BankDetailsTab      form={form} setField={setField} />}
        </div>

        {/* Footer Nav */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate('/suppliers')} className="btn-secondary text-sm">Cancel</button>
            {tab > 0 && (
              <button type="button" onClick={() => setTab(t => t - 1)}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors">
                <ChevronLeft size={15} /> Previous
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {TABS.map((_, i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all ${i === tab ? 'bg-emerald-600 w-5' : i < tab ? 'w-1.5 bg-emerald-300' : 'w-1.5 bg-slate-200'}`} />
              ))}
            </div>
            {tab === TABS.length - 1 ? (
              <button type="submit" disabled={saving} className="btn-primary px-8">
                {saving ? <><Spinner size="sm" /> Saving...</> : isEdit ? 'Save Changes' : 'Send for Approval →'}
              </button>
            ) : (
              <button type="button" onClick={() => setTab(t => t + 1)} className="btn-primary flex items-center gap-1.5">
                Next <ChevronRight size={15} />
              </button>
            )}
          </div>
        </div>

        </div>
      </form>
    </Layout>
  )
}