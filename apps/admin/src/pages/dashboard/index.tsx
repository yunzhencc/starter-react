import { createFileRoute } from '@tanstack/react-router';
import { DashboardView } from '@/views/dashboard';

export const Route = createFileRoute('/dashboard/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <DashboardView />;
}
