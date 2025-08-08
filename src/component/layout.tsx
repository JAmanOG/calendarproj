import React from 'react'
import Sidebar from './sidebar'

const Layout = ({children}:any) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-3 flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}

export default Layout   