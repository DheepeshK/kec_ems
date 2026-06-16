import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from './AppLayout';

export function AuthLayout() {
  return (
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  );
}
