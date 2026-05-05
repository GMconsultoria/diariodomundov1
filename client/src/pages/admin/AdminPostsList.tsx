import { trpc } from "@/lib/trpc";
import { Loader2, Edit, Trash2, Eye, EyeOff, Search, Filter } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { CATEGORIES } from "@shared/const";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { User } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

const PAGE_SIZE = 15;

export default function AdminPostsList() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [author, setAuthor] = useState("");
  const [isRefetching, setIsRefetching] = useState(false);

  // Debounce search to avoid "flashing" on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: posts, isLoading, refetch } = trpc.admin.posts.getAll.useQuery({
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
    category: category || undefined,
    search: debouncedSearch || undefined,
    author: author || undefined,
  }, {
    placeholderData: (previousData) => previousData, // Maintain data while loading to avoid flashing
  });

  const deleteMutation = trpc.admin.posts.delete.useMutation({
    onSuccess: () => {
      toast.success("Notícia deletada com sucesso!");
      refetch();
    },
  });

  const updateMutation = trpc.admin.posts.update.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado!");
      refetch();
    },
  });

  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const handleDelete = async () => {
    if (confirmDelete !== null) {
      await deleteMutation.mutateAsync({ id: confirmDelete });
      setConfirmDelete(null);
    }
  };

  const handleTogglePublish = async (id: number, published: boolean) => {
    await updateMutation.mutateAsync({
      id,
      published: !published,
    });
  };

  const handleRefresh = async () => {
    setIsRefetching(true);
    try {
      await refetch();
      toast.success("Notícias atualizadas!");
    } catch (error) {
      toast.error("Erro ao atualizar notícias");
      console.error(error);
    } finally {
      setIsRefetching(false);
    }
  };

  if (isLoading && page === 0) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Notícias</h1>
          <p className="text-muted-foreground">
            {user?.role === "editor" ? "Gerencie suas publicações" : "Gerencie o conteúdo do portal"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            disabled={isRefetching}
            className="px-4 py-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-sm font-semibold border border-border disabled:opacity-50 flex items-center gap-2"
          >
            {isRefetching && <Loader2 className="animate-spin" size={16} />}
            {isRefetching ? "Atualizando..." : "Atualizar"}
          </button>
          <Link href="/posts/new" className="no-underline">
            <button className="px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-red-700 transition-colors font-bold shadow-lg shadow-accent/20">
              + Nova Notícia
            </button>
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Pesquisar por título..."
            className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:border-accent text-sm"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </div>
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <select
            className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:border-accent text-sm appearance-none"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(0);
            }}
          >
            <option value="">Todas as Categorias</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        {user?.role === "admin" && (
          <div className="relative min-w-[200px]">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Filtrar por autor..."
              className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:border-accent text-sm"
              value={author}
              onChange={(e) => {
                setAuthor(e.target.value);
                setPage(0);
              }}
            />
          </div>
        )}
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {!posts || posts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">Nenhuma notícia encontrada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="py-4 px-6 font-semibold text-sm">Título</th>
                  <th className="py-4 px-6 font-semibold text-sm">Categoria</th>
                  <th className="py-4 px-6 font-semibold text-sm">Autor</th>
                  <th className="py-4 px-6 font-semibold text-sm">Status</th>
                  <th className="py-4 px-6 font-semibold text-sm text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-semibold line-clamp-1">{post.title}</span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {new Date(post.createdAt).toLocaleDateString('pt-BR')} • {post.views} views
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-1 bg-accent/5 text-accent text-[10px] font-bold rounded-full border border-accent/10">
                        {post.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm">{post.author}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        post.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {post.published ? "Publicada" : "Rascunho"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleTogglePublish(post.id, post.published)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title={post.published ? "Despublicar" : "Publicar"}
                        >
                          {post.published ? <Eye size={18} className="text-green-600" /> : <EyeOff size={18} className="text-gray-400" />}
                        </button>
                        <Link href={`/posts/${post.id}/edit`} className="p-2 hover:bg-muted rounded-lg transition-colors text-blue-600">
                          <Edit size={18} />
                        </Link>
                        {user?.role === "admin" && (
                          <button
                            onClick={() => setConfirmDelete(post.id)}
                            className="p-2 hover:bg-muted rounded-lg transition-colors text-red-600"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {posts && posts.length > 0 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground font-medium">Página {page + 1}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-2 bg-muted text-foreground rounded-lg disabled:opacity-50 font-bold text-sm"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={posts.length < PAGE_SIZE}
              className="px-4 py-2 bg-muted text-foreground rounded-lg disabled:opacity-50 font-bold text-sm"
            >
              Próxima
            </button>
          </div>
        </div>
      )}

      <AlertDialog open={confirmDelete !== null} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja deletar esta notícia? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Deletar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
