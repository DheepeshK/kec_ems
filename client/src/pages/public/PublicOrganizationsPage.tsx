import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Badge } from '../../components/ui/Badge';
import type { Organization } from '../../types';

export function PublicOrganizationsPage() {
  const { data: orgs, isLoading } = useQuery({
    queryKey: ['public-orgs'],
    queryFn: async () => {
      const res = await api.get('/public/organizations');
      return res.data.data as Organization[];
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" /></div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">Organizations</h1>
      <p className="mt-2 text-slate-600">Clubs, cells, forums, and departments at KEC</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {orgs?.map((org) => (
          <div key={org.id} className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-start gap-4">
              {org.logo_path ? (
                <img src={org.logo_path} alt="" className="h-14 w-14 rounded-lg object-cover" />
              ) : (
                <div className="h-14 w-14 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg">
                  {org.name.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="font-semibold text-slate-900">{org.name}</h3>
                <Badge className="mt-1">{org.type}</Badge>
              </div>
            </div>
            {org.description && (
              <p className="mt-4 text-sm text-slate-600">{org.description}</p>
            )}
            <p className="mt-3 text-sm text-primary-600">{org.event_count} events</p>
          </div>
        ))}
      </div>
    </div>
  );
}
