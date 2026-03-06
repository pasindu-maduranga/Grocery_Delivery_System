import { useState, useEffect } from 'react'
import { rolesAPI } from '../../api'
import { Spinner } from '../common'
import { ChevronDown, ChevronRight, CheckSquare, Square } from 'lucide-react'
import React from 'react'

const ACTIONS = ['canView', 'canCreate', 'canEdit', 'canDelete']
const ACTION_LABELS = { canView: 'View', canCreate: 'Create', canEdit: 'Edit', canDelete: 'Delete' }

export default function PermissionPanel({ role, onClose }) {
  const [structure, setStructure] = useState([])
  const [permissions, setPermissions] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchPermissions() }, [role._id])

  const fetchPermissions = async () => {
    setLoading(true)
    try {
      const res = await rolesAPI.getPermissions(role._id)
      setStructure(res.data.data)
      const map = {}
      res.data.data.forEach(pm => {
        pm.menus.forEach(menu => {
          menu.screens.forEach(screen => {
            map[screen.screenCode] = {
              canView: screen.canView,
              canCreate: screen.canCreate,
              canEdit: screen.canEdit,
              canDelete: screen.canDelete,
            }
          })
        })
      })
      setPermissions(map)
    } finally { setLoading(false) }
  }

  const toggle = (screenCode, action) => {
    setPermissions(prev => ({
      ...prev,
      [screenCode]: { ...prev[screenCode], [action]: !prev[screenCode]?.[action] }
    }))
  }

  const toggleScreen = (screenCode) => {
    const current = permissions[screenCode] || {}
    const allOn = ACTIONS.every(a => current[a])
    setPermissions(prev => ({
      ...prev,
      [screenCode]: Object.fromEntries(ACTIONS.map(a => [a, !allOn]))
    }))
  }

  const toggleParentMenu = (pm) => {
    const allCodes = pm.menus.flatMap(m => m.screens.map(s => s.screenCode))
    const allOn = allCodes.every(c => ACTIONS.every(a => permissions[c]?.[a]))
    const update = {}
    allCodes.forEach(c => { update[c] = Object.fromEntries(ACTIONS.map(a => [a, !allOn])) })
    setPermissions(prev => ({ ...prev, ...update }))
  }

  const isScreenAllOn = (screenCode) => ACTIONS.every(a => permissions[screenCode]?.[a])
  const isParentAllOn = (pm) => {
    const codes = pm.menus.flatMap(m => m.screens.map(s => s.screenCode))
    return codes.length > 0 && codes.every(c => ACTIONS.every(a => permissions[c]?.[a]))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const perms = Object.entries(permissions).map(([screenCode, p]) => ({ screenCode, ...p }))
      await rolesAPI.updatePermissions(role._id, { permissions: perms })
      onClose()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save permissions')
    } finally { setSaving(false) }
  }

  if (loading) return <div className="p-12 flex justify-center"><Spinner size="lg" /></div>

  return (
    <div>
      <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <p className="text-xs text-slate-500">Check the modules and actions this role can access</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary text-xs px-3 py-1.5">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-xs px-3 py-1.5">
            {saving && <Spinner size="sm" />} Save Permissions
          </button>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 gap-4 max-h-[60vh] overflow-y-auto">
        {structure.map(pm => (
          <ParentMenuBlock
            key={pm.parentMenuCode}
            pm={pm}
            permissions={permissions}
            isAllOn={isParentAllOn(pm)}
            onToggleParent={() => toggleParentMenu(pm)}
            onToggleScreen={toggleScreen}
            onToggleAction={toggle}
            isScreenAllOn={isScreenAllOn}
          />
        ))}
      </div>
    </div>
  )
}

const ParentMenuBlock = ({ pm, permissions, isAllOn, onToggleParent, onToggleScreen, onToggleAction, isScreenAllOn }) => {
  const [open, setOpen] = useState(true)
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-3">
          <button
            onClick={e => { e.stopPropagation(); onToggleParent() }}
            className="text-primary-600 hover:text-primary-700 transition-colors"
          >
            {isAllOn ? <CheckSquare size={18} /> : <Square size={18} className="text-slate-300" />}
          </button>
          <span className="font-semibold text-sm text-slate-700">{pm.parentMenuName}</span>
        </div>
        {open ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
      </div>

      {open && (
        <div className="divide-y divide-slate-100">
          {pm.menus.map(menu => (
            menu.screens.map(screen => (
              <ScreenRow
                key={screen.screenCode}
                screen={screen}
                menuName={menu.menuName}
                permissions={permissions[screen.screenCode] || {}}
                allOn={isScreenAllOn(screen.screenCode)}
                onToggleScreen={() => onToggleScreen(screen.screenCode)}
                onToggleAction={(action) => onToggleAction(screen.screenCode, action)}
              />
            ))
          ))}
        </div>
      )}
    </div>
  )
}

const ScreenRow = ({ screen, menuName, permissions, allOn, onToggleScreen, onToggleAction }) => (
  <div className="flex items-center px-4 py-3 hover:bg-slate-50 transition-colors">
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <button onClick={onToggleScreen} className="text-primary-600 flex-shrink-0">
        {allOn ? <CheckSquare size={16} /> : <Square size={16} className="text-slate-300" />}
      </button>
      <div className="min-w-0">
        <div className="text-sm font-medium text-slate-700">{screen.screenName}</div>
        <div className="text-xs text-slate-400">{menuName}</div>
      </div>
    </div>
    <div className="flex items-center gap-6 ml-4">
      {ACTIONS.map(action => (
        <label key={action} className="flex flex-col items-center gap-1 cursor-pointer">
          <span className="text-xs text-slate-400">{ACTION_LABELS[action]}</span>
          <input
            type="checkbox"
            checked={permissions[action] || false}
            onChange={() => onToggleAction(action)}
            className="w-4 h-4 rounded accent-primary-600 cursor-pointer"
          />
        </label>
      ))}
    </div>
  </div>
)