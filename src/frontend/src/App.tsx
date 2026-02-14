import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { AuthProvider } from './auth/AuthProvider';
import { useAuth } from './auth/useAuth';
import AppLayout from './components/AppLayout';
import PostsListPage from './pages/PostsListPage';
import PostDetailPage from './pages/PostDetailPage';
import MyPostsPage from './pages/MyPostsPage';
import PostEditorPage from './pages/PostEditorPage';
import AdminConsolePage from './pages/admin/AdminConsolePage';
import LoginPage from './pages/LoginPage';
import AccessDeniedScreen from './components/AccessDeniedScreen';

// Root component
function RootComponent() {
  const { isAuthenticated, isInitializing } = useAuth();
  
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <AppLayout />;
}

// Root route with layout
const rootRoute = createRootRoute({
  component: RootComponent,
});

// Public routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: PostsListPage,
});

const postDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/post/$postIndex',
  component: PostDetailPage,
});

// Engineer/Admin route components
function MyPostsRouteComponent() {
  const { isEngineer, isAdmin } = useAuth();
  if (!isEngineer && !isAdmin) {
    return <AccessDeniedScreen />;
  }
  return <MyPostsPage />;
}

function EditorRouteComponent() {
  const { isEngineer, isAdmin } = useAuth();
  if (!isEngineer && !isAdmin) {
    return <AccessDeniedScreen />;
  }
  return <PostEditorPage />;
}

function EditPostRouteComponent() {
  const { isEngineer, isAdmin } = useAuth();
  if (!isEngineer && !isAdmin) {
    return <AccessDeniedScreen />;
  }
  return <PostEditorPage />;
}

// Admin route component
function AdminRouteComponent() {
  const { isAdmin } = useAuth();
  if (!isAdmin) {
    return <AccessDeniedScreen />;
  }
  return <AdminConsolePage />;
}

// Engineer/Admin routes
const myPostsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-posts',
  component: MyPostsRouteComponent,
});

const editorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/editor',
  component: EditorRouteComponent,
});

const editPostRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/editor/$postIndex',
  component: EditPostRouteComponent,
});

// Admin routes
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminRouteComponent,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  postDetailRoute,
  myPostsRoute,
  editorRoute,
  editPostRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
