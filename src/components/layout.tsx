import Sidebar from '../components/sidebar'
import {DndContext} from '@dnd-kit/core';

const Layout = ({children}:any) => {
  return (
    <DndContext>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="ml-3 flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </DndContext>
  )
}

export default Layout   