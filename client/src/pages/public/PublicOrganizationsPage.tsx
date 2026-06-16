import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';
import api from '../../services/api';
import { Badge } from '../../components/ui/Badge';
import type { Organization } from '../../types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export function PublicOrganizationsPage() {
  const { data: orgs, isLoading } = useQuery({
    queryKey: ['public-orgs'],
    queryFn: async () => {
      const res = await api.get('/public/organizations');
      return res.data.data as Organization[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="h-12 w-12 rounded-full border-4 border-primary-200 border-t-primary-600"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900">
          <span className="gradient-text">Organizations</span> & Communities
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Discover clubs, cells, forums, and departments shaping the KEC community
        </p>
      </motion.div>

      {orgs && orgs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Building2 className="mx-auto h-16 w-16 text-slate-300 mb-4" />
          <p className="text-lg text-slate-500 font-medium">No organizations available yet</p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {orgs?.map((org) => (
            <motion.div
              key={org.id}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="group"
            >
              <div className="glass shadow-premium-sm hover:shadow-premium-lg rounded-2xl p-6 h-full transition-all duration-300 border border-white/50 hover:border-primary-500/50">
                <div className="flex items-start gap-4 mb-4">
                  <motion.div whileHover={{ scale: 1.05 }}>
                    {org.logo_path ? (
                      <img
                        src={org.logo_path}
                        alt={org.name}
                        className="h-16 w-16 rounded-xl object-cover shadow-premium-sm group-hover:shadow-premium"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center text-primary-600 font-bold text-xl border border-primary-200/50">
                        {org.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors truncate">
                      {org.name}
                    </h3>
                    <Badge className="mt-2">{org.type}</Badge>
                  </div>
                </div>

                {org.description && (
                  <p className="text-sm text-slate-600 line-clamp-3">
                    {org.description}
                  </p>
                )}

                <motion.div
                  className="mt-4 pt-4 border-t border-slate-200/50 flex items-center justify-between"
                  whileHover={{ x: 4 }}
                >
                  <span className="text-xs font-semibold text-accent-600 bg-accent-50 px-2.5 py-1 rounded-full">
                    {org.event_count} Events
                  </span>
                  <span className="text-slate-400">→</span>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
