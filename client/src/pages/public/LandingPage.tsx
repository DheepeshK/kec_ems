import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Building2, Users } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import type { Organization } from '../../types';

export function LandingPage() {
  const { data: orgs } = useQuery({
    queryKey: ['public-orgs'],
    queryFn: async () => {
      const res = await api.get('/public/organizations');
      return res.data.data as Organization[];
    },
  });

  return (
    <div>
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            KEC Event Management System
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-primary-100">
            A centralized platform for managing institutional events, attendance tracking,
            and organization activities at KEC.
          </p>
          <div className="mt-8 flex gap-4">
            <Link to="/events">
              <Button size="lg" className="bg-white text-primary-700 hover:bg-primary-50">
                Browse Events
              </Button>
            </Link>
            <Link to="/organizations">
              <Button size="lg" variant="secondary" className="bg-primary-500 text-white hover:bg-primary-400 border-0">
                View Organizations
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">Event Management</h3>
            <p className="mt-2 text-sm text-slate-600">Plan, approve, and track events across organizations</p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">Attendance Tracking</h3>
            <p className="mt-2 text-sm text-slate-600">Barcode scanning and manual attendance entry</p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
              <Building2 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">Organization Hub</h3>
            <p className="mt-2 text-sm text-slate-600">Clubs, cells, forums, and departments showcase</p>
          </div>
        </div>
      </section>

      {orgs && orgs.length > 0 && (
        <section className="bg-white border-t border-slate-200">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-slate-900">Featured Organizations</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {orgs.slice(0, 6).map((org) => (
                <div key={org.id} className="rounded-xl border border-slate-200 p-6">
                  {org.logo_path && (
                    <img src={org.logo_path} alt="" className="h-12 w-12 rounded-lg object-cover mb-4" />
                  )}
                  <h3 className="font-semibold text-slate-900">{org.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{org.type}</p>
                  <p className="text-sm text-slate-600 mt-2">{org.description}</p>
                  <p className="text-xs text-primary-600 mt-2">{org.event_count} events</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
