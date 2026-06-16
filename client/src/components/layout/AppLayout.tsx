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
import { motion } from 'framer-motion';
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

  const sidebarVariants = {
    hidden: { x: '-100%', opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-surface-secondary via-surface to-surface-tertiary">
      {/* Overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial={sidebarOpen ? 'visible' : 'hidden'}
        animate={sidebarOpen ? 'visible' : 'hidden'}
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-gradient-to-b from-dark-accent to-slate-900 lg:static lg:z-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Sidebar Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex h-20 items-center justify-between px-6 border-b border-slate-700/50"
        >
          <Link to="/dashboard" className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent"
            >
              KEC
            </motion.div>
          </Link>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="lg:hidden text-slate-300 hover:text-white transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </motion.button>
        </motion.div>

        {/* Navigation */}
        <motion.nav
          className="mt-8 space-y-2 px-3"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.05,
              },
            },
          }}
        >
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <motion.div key={item.path} variants={itemVariants}>
                <Link
                  to={item.path}
                  className="relative group"
                  onClick={() => setSidebarOpen(false)}
                >
                  <motion.div
                    whileHover={{ x: 4 }}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-500/30 to-accent-500/30 text-primary-300 border border-primary-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary-500/20 to-accent-500/20 -z-10"
                        transition={{ duration: 0.3 }}
                      />
                    )}
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </motion.nav>

        {/* User Info & Logout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-0 w-full border-t border-slate-700/50 bg-gradient-to-t from-slate-900 to-slate-800/50 p-4"
        >
          <div className="mb-3 px-3">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize">
              {user?.role.replace('_', ' ')}
            </p>
          </div>
          <motion.button
            whileHover={{ backgroundColor: 'rgba(88, 86, 214, 0.1)' }}
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </motion.button>
        </motion.div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-30 flex h-20 items-center gap-4 border-b border-slate-200/50 glass px-4 lg:px-8"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="lg:hidden text-slate-600 hover:text-slate-900 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </motion.button>

          <div className="flex-1" />

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2"
          >
            <Link
              to="/"
              className="px-4 py-2 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors"
            >
              View Public Site
            </Link>
          </motion.div>
        </motion.header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
