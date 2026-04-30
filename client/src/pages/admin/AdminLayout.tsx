import { useAuth } from "@/_core/hooks/useAuth";
import { Route, Switch, Link, useLocation, Router } from "wouter";
import { Loader2, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import AdminDashboard from "./AdminDashboard";
import AdminPostsList from "./AdminPostsList";
import AdminCreatePost from "./AdminCreatePost";
import AdminEditPost from "./AdminEditPost";
import { trpc } from "@/lib/trpc";

export default function AdminLayout() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [, setLocation] = useLocation();

  const API_BASE_URL = import.meta.env.VITE_API_URL || "";
  const loginUrl = `${API_BASE_URL}/api/auth-login?returnTo=/admin`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Acesso Negado</h1>
          <p className="text-muted-foreground mb-6">
            Você precisa ser um administrador para acessar esta área.
          </p>
          {!isAuthenticated ? (
            <a href={loginUrl} className="no-underline">
              <button className="px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-red-700 transition-colors font-semibold">
                Fazer Login
              </button>
            </a>
          ) : (
            <Link href="/" className="no-underline">
              <button className="px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-red-700 transition-colors font-semibold">
                Voltar para Home
              </button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Router base="/admin">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "w-64" : "w-20"
          } bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 flex flex-col`}
        >
          {/* Header */}
          <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
            {sidebarOpen && <h2 className="text-lg font-bold text-accent">Admin</h2>}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <NavLink
              href="/"
              label="Dashboard"
              sidebarOpen={sidebarOpen}
            />
            <NavLink
              href="/posts"
              label="Notícias"
              sidebarOpen={sidebarOpen}
            />
            <NavLink
              href="/posts/new"
              label="Nova Notícia"
              sidebarOpen={sidebarOpen}
            />
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-sidebar-border">
            {sidebarOpen && (
              <div className="mb-4">
                <p className="text-sm font-semibold truncate">{user?.name}</p>
                <p className="text-xs text-sidebar-accent">{user?.email}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-full px-3 py-2 bg-sidebar-accent text-sidebar-accent-foreground rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
            >
              <LogOut size={16} />
              {sidebarOpen && "Sair"}
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-auto">
          <Switch>
            <Route path="/" component={AdminDashboard} />
            <Route path="/posts" component={AdminPostsList} />
            <Route path="/posts/new" component={AdminCreatePost} />
            <Route path="/posts/:id/edit" component={AdminEditPost} />
          </Switch>
        </main>
      </Router>
    </div>
  );
}

function NavLink({
  href,
  label,
  sidebarOpen,
}: {
  href: string;
  label: string;
  sidebarOpen: boolean;
}) {
  const [location] = useLocation();
  // Exact match for /admin root to avoid always-active highlight on subroutes
  const isActive =
    href === "/"
      ? location === "/" || location === ""
      : location === href || location.startsWith(href + "/");

  return (
    <Link href={href} className="no-underline">
      <button
        className={`w-full px-3 py-2 rounded-lg transition-colors text-sm font-semibold text-left flex items-center gap-3 ${
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "hover:bg-sidebar-primary text-sidebar-foreground"
        }`}
      >
        <span className="w-5 h-5 flex-shrink-0" />
        {sidebarOpen && label}
      </button>
    </Link>
  );
}
