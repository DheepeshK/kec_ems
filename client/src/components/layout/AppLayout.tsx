import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Building2,
  Users,
  LogOut,
  Menu,
  X,
  CheckSquare,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['super_admin', 'club_admin', 'faculty', 'volunteer'] as UserRole[] },
  { path: '/events/manage', label: 'Events', icon: Calendar, roles: ['super_admin', 'club_admin', 'faculty'] as UserRole[] },
  { path: '/events/approvals', label: 'Approvals', icon: CheckSquare, roles: ['super_admin', 'club_admin'] as UserRole[] },
  { path: '/admin/organizations', label: 'Organizations', icon: Building2, roles: ['super_admin', 'club_admin'] as UserRole[] },
  { path: '/admin/students', label: 'Students', icon: Users, roles: ['super_admin'] as UserRole[] },
];

export function AppLayout() {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredNav = navItems.filter((item) => hasRole(...item.roles));

  return (
    <div className="flex min-h-screen bg-slate-50">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-slate-900 transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <Link to="/dashboard" className="text-xl font-bold text-white">KEC EMS</Link>
          <button className="lg:hidden text-white" onClick={() => setSidebarOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-4 space-y-1 px-3">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-slate-700 p-4">
          <div className="mb-3 px-3">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-slate-400">{user?.role.replace('_', ' ')}</p>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-4 lg:px-8">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6 text-slate-600" />
          </button>
          <div className="flex-1" />
          <Link to="/" className="text-sm text-primary-600 hover:text-primary-700">
            View Public Site
          </Link>
        </header>
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
