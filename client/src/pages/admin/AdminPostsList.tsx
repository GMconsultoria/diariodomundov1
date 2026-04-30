import { trpc } from "@/lib/trpc";
import { Loader2, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
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

const PAGE_SIZE = 20;

export default function AdminPostsList() {
  const [page, setPage] = useState(0);

  const { data: posts, isLoading, refetch } = trpc.admin.posts.getAll.useQuery({
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  const deleteMutation = trpc.admin.posts.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const updateMutation = trpc.admin.posts.update.useMutation({
    onSuccess: () => {
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

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Notícias</h1>
          <p className="text-muted-foreground">
            Gerencie todas as notícias do portal
          </p>
        </div>
        <Link href="/admin/posts/new" className="no-underline">
          <button className="px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-red-700 transition-colors font-semibold">
            + Nova Notícia
          </button>
        </Link>
      </div>

      {!posts || posts.length === 0 ? (
        <div className="bg-card text-card-foreground rounded-lg p-12 border border-border text-center">
          <p className="text-muted-foreground mb-4">
            Nenhuma notícia encontrada
          </p>
          <Link href="/admin/posts/new" className="no-underline">
            <button className="px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-red-700 transition-colors font-semibold">
              Criar Primeira Notícia
            </button>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">Título</th>
                <th className="text-left py-3 px-4 font-semibold">Categoria</th>
                <th className="text-left py-3 px-4 font-semibold">Autor</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-left py-3 px-4 font-semibold">Data</th>
                <th className="text-left py-3 px-4 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-border hover:bg-muted transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-semibold line-clamp-1">{post.title}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="badge-category">{post.category}</span>
                  </td>
                  <td className="py-3 px-4 text-sm">{post.author}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        post.published
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {post.published ? "Publicada" : "Rascunho"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleTogglePublish(post.id, post.published)
                        }
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title={post.published ? "Despublicar" : "Publicar"}
                      >
                        {post.published ? (
                          <Eye size={18} className="text-green-600" />
                        ) : (
                          <EyeOff size={18} className="text-gray-400" />
                        )}
                      </button>
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="no-underline"
                      >
                        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                          <Edit size={18} className="text-blue-600" />
                        </button>
                      </Link>
                      <button
                        onClick={() => setConfirmDelete(post.id)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination controls */}
      {posts && posts.length > 0 && (
        <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 bg-muted text-foreground rounded-lg disabled:opacity-50 font-semibold"
          >
            Anterior
          </button>
          <span className="text-muted-foreground font-semibold">Página {page + 1}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={posts.length < PAGE_SIZE}
            className="px-4 py-2 bg-muted text-foreground rounded-lg disabled:opacity-50 font-semibold"
          >
            Próxima
          </button>
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
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
