import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, Users } from 'lucide-react';
import api from '../../services/api';
import { Badge, statusBadgeVariant } from '../../components/ui/Badge';
import type { Event } from '../../types';

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

export function PublicEventsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['public-events'],
    queryFn: async () => {
      const res = await api.get('/public/events');
      return res.data.data as { events: Event[]; total: number };
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
          Explore <span className="gradient-text">Events</span>
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Browse all approved and completed institutional events happening at KEC
        </p>
      </motion.div>

      {data?.events.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Calendar className="mx-auto h-16 w-16 text-slate-300 mb-4" />
          <p className="text-lg text-slate-500 font-medium">No public events available yet</p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {data?.events.map((event) => (
            <motion.div
              key={event.id}
              variants={itemVariants}
              whileHover={{ y: -8 }}
            >
              <Link to={`/events/${event.id}`} className="group h-full">
                <div className="glass shadow-premium-sm hover:shadow-premium-lg rounded-2xl p-6 h-full transition-all duration-300 border border-white/50 hover:border-primary-500/50">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant={statusBadgeVariant(event.status)}>
                      {event.status}
                    </Badge>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      className="rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 p-2"
                    >
                      <Calendar className="h-4 w-4 text-primary-600" />
                    </motion.div>
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                    {event.title}
                  </h3>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="h-4 w-4 flex-shrink-0 text-accent-600" />
                      <span>{event.start_date} — {event.end_date}</span>
                    </div>
                    {event.organizations && event.organizations.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Users className="h-4 w-4 flex-shrink-0 text-accent-600" />
                        <span className="truncate">
                          {event.organizations.map((o) => o.name).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  <motion.div
                    className="mt-4 pt-4 border-t border-slate-200/50 flex items-center justify-between text-sm font-medium text-primary-600"
                    whileHover={{ x: 4 }}
                  >
                    <span>View Details</span>
                    <span>→</span>
                  </motion.div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
