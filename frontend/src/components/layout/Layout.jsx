import Sidebar from './Sidebar'
import Topbar from './Topbar'
import React from 'react'

export default function Layout({ children, title, subtitle }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 ml-16 flex flex-col min-h-screen">
        <Topbar title={title} subtitle={subtitle} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}