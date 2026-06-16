import { Link, Outlet } from 'react-router-dom';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-xl font-bold text-primary-600">KEC EMS</Link>
          <nav className="flex items-center gap-6">
            <Link to="/events" className="text-sm font-medium text-slate-600 hover:text-primary-600">Events</Link>
            <Link to="/organizations" className="text-sm font-medium text-slate-600 hover:text-primary-600">Organizations</Link>
            <Link to="/login" className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
              Staff Login
            </Link>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-500">
          KEC Event Management System
        </div>
      </footer>
    </div>
  );
}
