import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { LayoutContent } from '@/components/layout/layout-content';
import { AuthProvider } from '@/context/AuthContext';
import { TaskProvider } from '@/context/TaskContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SkipLink } from '@/lib/a11y';
import { Loader2 } from 'lucide-react';

// Lazy-loaded pages with code splitting
const DashboardPage = lazy(() => import('./app/page'));
const PipelinesPage = lazy(() => import('./app/pipelines/page'));
const ModelsPage = lazy(() => import('./app/models/page'));
const ClientsPage = lazy(() => import('./app/clients/page'));
const AuditPage = lazy(() => import('./app/audit/page'));
const SettingsPage = lazy(() => import('./app/settings/page'));
const LoginPage = lazy(() => import('./app/login/page'));

// Portal pages (lazy-loaded together with their layout)
const PortalLayout = lazy(() => import('./app/portal/layout'));
const PortalOverviewPage = lazy(() => import('./app/portal/page'));
const ScoreBorrowerPage = lazy(() => import('./app/portal/score/page'));
const BatchScoringPage = lazy(() => import('./app/portal/batch-scoring/page'));
const ApiKeysPage = lazy(() => import('./app/portal/api-keys/page'));
const UsagePage = lazy(() => import('./app/portal/usage/page'));
const OutcomesPage = lazy(() => import('./app/portal/outcomes/page'));
const ReviewsPage = lazy(() => import('./app/portal/reviews/page'));
const ConsentPage = lazy(() => import('./app/portal/consent/page'));
const DeveloperPortalPage = lazy(() => import('./app/portal/docs/page'));
const WebhooksPage = lazy(() => import('./app/portal/webhooks/page'));
const HistoryPage = lazy(() => import('./app/portal/history/page'));

// Shared loading spinner for lazy-loaded routes
function RouteLoader() {
  return (
    <div className="h-screen w-screen bg-credaly-bg flex items-center justify-center flex-col gap-4">
      <Loader2 size={32} className="animate-spin" color="#F5A623" />
      <p className="text-credaly-muted/50 text-sm">Loading page...</p>
    </div>
  );
}

// Wrapper for lazy-loaded protected routes
function LazyRoute({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<RouteLoader />}>
      <ProtectedRoute>{children}</ProtectedRoute>
    </Suspense>
  );
}

// Wrapper for lazy-loaded public routes
function LazyPublicRoute({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<RouteLoader />}>
      {children}
    </Suspense>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <SkipLink />
        <LayoutContent>
          <Routes>
            <Route path="/login" element={<LazyPublicRoute><LoginPage /></LazyPublicRoute>} />

            {/* Admin routes (Protected) */}
            <Route path="/" element={<LazyRoute><DashboardPage /></LazyRoute>} />
            <Route path="/pipelines" element={<LazyRoute><PipelinesPage /></LazyRoute>} />
            <Route path="/models" element={<LazyRoute><ModelsPage /></LazyRoute>} />
            <Route path="/clients" element={<LazyRoute><ClientsPage /></LazyRoute>} />
            <Route path="/audit" element={<LazyRoute><AuditPage /></LazyRoute>} />
            <Route path="/settings" element={<LazyRoute><SettingsPage /></LazyRoute>} />

            {/* Portal routes (Protected) */}
            <Route path="/portal" element={<LazyRoute><PortalLayout><PortalOverviewPage /></PortalLayout></LazyRoute>} />
            <Route path="/portal/score" element={<LazyRoute><PortalLayout><ScoreBorrowerPage /></PortalLayout></LazyRoute>} />
            <Route path="/portal/batch-scoring" element={<LazyRoute><PortalLayout><BatchScoringPage /></PortalLayout></LazyRoute>} />
            <Route path="/portal/api-keys" element={<LazyRoute><PortalLayout><ApiKeysPage /></PortalLayout></LazyRoute>} />
            <Route path="/portal/usage" element={<LazyRoute><PortalLayout><UsagePage /></PortalLayout></LazyRoute>} />
            <Route path="/portal/outcomes" element={<LazyRoute><PortalLayout><OutcomesPage /></PortalLayout></LazyRoute>} />
            <Route path="/portal/reviews" element={<LazyRoute><PortalLayout><ReviewsPage /></PortalLayout></LazyRoute>} />
            <Route path="/portal/consent" element={<LazyRoute><PortalLayout><ConsentPage /></PortalLayout></LazyRoute>} />
            <Route path="/portal/docs" element={<LazyRoute><PortalLayout><DeveloperPortalPage /></PortalLayout></LazyRoute>} />
            <Route path="/portal/webhooks" element={<LazyRoute><PortalLayout><WebhooksPage /></PortalLayout></LazyRoute>} />
            <Route path="/portal/history" element={<LazyRoute><PortalLayout><HistoryPage /></PortalLayout></LazyRoute>} />
          </Routes>
        </LayoutContent>
      </TaskProvider>
    </AuthProvider>
  );
}
