import { trpc } from "@/lib/trpc";
import { Loader2, FileText, Eye, Layers } from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { data: stats, isLoading, error } = trpc.admin.getStats.useQuery();

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-red-500">Erro ao carregar estatísticas. Tente novamente.</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao painel administrativo do Diário do Mundo
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total posts */}
        <div className="bg-card text-card-foreground rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-semibold">
                Total de Notícias
              </p>
              <p className="text-3xl font-bold mt-2">{stats?.totalPosts || 0}</p>
            </div>
            <FileText className="text-accent" size={40} />
          </div>
        </div>

        {/* Total views */}
        <div className="bg-card text-card-foreground rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-semibold">
                Visualizações
              </p>
              <p className="text-3xl font-bold mt-2">{stats?.totalViews || 0}</p>
            </div>
            <Eye className="text-accent" size={40} />
          </div>
        </div>

        {/* Categories */}
        <div className="bg-card text-card-foreground rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-semibold">
                Categorias
              </p>
              <p className="text-3xl font-bold mt-2">
                {Object.keys(stats?.categories || {}).length}
              </p>
            </div>
            <Layers className="text-accent" size={40} />
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-card text-card-foreground rounded-lg p-6 border border-border">
        <h2 className="text-xl font-bold mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/admin/posts/new" className="no-underline">
            <button className="w-full px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-red-700 transition-colors font-semibold">
              + Nova Notícia
            </button>
          </Link>
          <Link href="/admin/posts" className="no-underline">
            <button className="w-full px-6 py-3 bg-muted text-foreground rounded-lg hover:bg-gray-300 transition-colors font-semibold">
              Ver Todas as Notícias
            </button>
          </Link>
        </div>
      </div>

      {/* Categories breakdown */}
      {stats && Object.keys(stats.categories).length > 0 && (
        <div className="bg-card text-card-foreground rounded-lg p-6 border border-border mt-6">
          <h2 className="text-xl font-bold mb-4">Notícias por Categoria</h2>
          <div className="space-y-3">
            {Object.entries(stats.categories).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="font-semibold">{category}</span>
                <span className="bg-muted px-3 py-1 rounded-full text-sm font-bold">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
