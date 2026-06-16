import { Link, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-secondary via-surface to-surface-tertiary flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 border-b border-slate-200/50 glass"
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent"
            >
              KEC
            </motion.div>
          </Link>
          <nav className="flex items-center gap-8">
            <motion.div whileHover={{ y: -2 }}>
              <Link to="/events" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">
                Events
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -2 }}>
              <Link to="/organizations" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">
                Organizations
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link
                to="/login"
                className="rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-2 text-sm font-semibold text-white hover:shadow-premium-lg transition-all"
              >
                Staff Login
              </Link>
            </motion.div>
          </nav>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="border-t border-slate-200/50 glass"
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">About</h3>
              <p className="mt-3 text-sm text-slate-600">
                KEC Event Management System for institutional events and organization management.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Features</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-primary-600">Event Management</a></li>
                <li><a href="#" className="hover:text-primary-600">Attendance Tracking</a></li>
                <li><a href="#" className="hover:text-primary-600">Organizations</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Contact</h3>
              <p className="mt-3 text-sm text-slate-600">
                For support and inquiries, contact the KEC administration.
              </p>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-200/50 pt-8 text-center text-sm text-slate-600">
            <p>© 2024 KEC Event Management System. All rights reserved.</p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
