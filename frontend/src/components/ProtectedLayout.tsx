import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function ProtectedLayout() {
  return (
    <div className="min-h-screen bg-navy-950 flex">
      <Sidebar />
      <Outlet />
    </div>
  )
}
