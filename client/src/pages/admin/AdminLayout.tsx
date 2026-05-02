import { useAuth } from "@/_core/hooks/useAuth";
import { Route, Switch, Link, useLocation, Router } from "wouter";
import { Loader2, LogOut, Menu, X, LayoutDashboard, FileText as FileTextIcon, PlusCircle, Users, Shield, User as UserIcon } from "lucide-react";
import { useState } from "react";
import AdminDashboard from "./AdminDashboard";
import AdminPostsList from "./AdminPostsList";
import AdminCreatePost from "./AdminCreatePost";
import AdminEditPost from "./AdminEditPost";
import AdminUsersList from "./AdminUsersList";

export default function AdminLayout() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [, setLocation] = useLocation();

  const API_BASE_URL = import.meta.env.VITE_API_URL || "";
  const loginUrl = `${API_BASE_URL}/api/auth/login?returnTo=/admin`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    );
  }

  const isAllowed = isAuthenticated && (user?.role === "admin" || user?.role === "editor");

  if (!isAllowed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield size={40} />
          </div>
          <h1 className="text-3xl font-bold mb-4">Acesso Negado</h1>
          <p className="text-muted-foreground mb-8">
            Você não tem permissão para acessar o painel administrativo. 
            Esta área é restrita a redatores e administradores.
          </p>
          {!isAuthenticated ? (
            <a href={loginUrl} className="no-underline">
              <button className="w-full px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-red-700 transition-all font-bold shadow-lg shadow-accent/20">
                Fazer Login
              </button>
            </a>
          ) : (
            <Link href="/" className="no-underline">
              <button className="w-full px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-red-700 transition-all font-bold shadow-lg shadow-accent/20">
                Voltar para o Site
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

  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-background flex">
      <Router base="/admin">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "w-64" : "w-20"
          } bg-card text-foreground border-r border-border transition-all duration-300 flex flex-col shadow-xl z-20`}
        >
          {/* Header */}
          <div className="p-6 border-b border-border flex items-center justify-between">
            {sidebarOpen && (
              <a href="/" className="flex items-center gap-2 no-underline text-foreground hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-accent rounded flex items-center justify-center text-white font-bold shadow-lg shadow-accent/20">D</div>
                <span className="font-bold text-lg tracking-tight">Painel</span>
              </a>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {isAdmin && (
              <NavLink
                href="/"
                label="Dashboard"
                icon={<LayoutDashboard size={20} />}
                sidebarOpen={sidebarOpen}
              />
            )}
            <NavLink
              href="/posts"
              label="Notícias"
              icon={<FileTextIcon size={20} />}
              sidebarOpen={sidebarOpen}
            />
            <NavLink
              href="/posts/new"
              label="Publicar"
              icon={<PlusCircle size={20} />}
              sidebarOpen={sidebarOpen}
            />
            {isAdmin && (
              <NavLink
                href="/users"
                label="Usuários"
                icon={<Users size={20} />}
                sidebarOpen={sidebarOpen}
              />
            )}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-border bg-muted/30">
            {sidebarOpen && (
              <div className="mb-4 px-2">
                <p className="text-sm font-bold truncate flex items-center gap-2">
                  <UserIcon size={14} className="text-accent" />
                  {user?.name}
                </p>
                <p className="text-[10px] uppercase font-bold text-muted-foreground mt-1 tracking-widest">
                  {user?.role === "admin" ? "Administrador" : "Redator"}
                </p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-full px-3 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all text-sm font-bold flex items-center justify-center gap-2"
            >
              <LogOut size={18} />
              {sidebarOpen && "Sair do Painel"}
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-auto bg-muted/10">
          <Switch>
            {isAdmin && <Route path="/" component={AdminDashboard} />}
            <Route path="/posts" component={AdminPostsList} />
            <Route path="/posts/new" component={AdminCreatePost} />
            <Route path="/posts/:id/edit" component={AdminEditPost} />
            {isAdmin && <Route path="/users" component={AdminUsersList} />}
            {/* Fallback to first available route */}
            <Route>
              <div className="p-8">
                {isAdmin ? <AdminDashboard /> : <AdminPostsList />}
              </div>
            </Route>
          </Switch>
        </main>
      </Router>
    </div>
  );
}

function NavLink({
  href,
  label,
  icon,
  sidebarOpen,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  sidebarOpen: boolean;
}) {
  const [location] = useLocation();
  const isActive =
    href === "/"
      ? location === "/" || location === ""
      : location === href || (location.startsWith(href + "/") && (href !== "/posts" || !location.startsWith("/posts/new")));

  return (
    <Link href={href} className="no-underline block">
      <button
        className={`w-full px-3 py-3 rounded-lg transition-all text-sm font-bold text-left flex items-center gap-3 ${
          isActive
            ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20"
            : "hover:bg-muted text-muted-foreground hover:text-foreground"
        }`}
      >
        <span className="flex-shrink-0">{icon}</span>
        {sidebarOpen && <span>{label}</span>}
      </button>
    </Link>
  );
}
