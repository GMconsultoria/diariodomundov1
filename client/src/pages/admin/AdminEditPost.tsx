import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, Upload } from "lucide-react";

const CATEGORIES = ["Política", "Economia", "Investimentos", "Ciência e Tecnologia", "Curiosidade"];

export default function AdminEditPost() {
  const [match, params] = useRoute("/admin/posts/:id/edit");
  const [, setLocation] = useLocation();
  const postId = params?.id ? parseInt(params.id) : null;

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    content: "",
    category: "Política" as const,
    author: "",
    imageUrl: "",
    published: false,
  });

  const [imageLoading, setImageLoading] = useState(false);

  const updateMutation = trpc.admin.posts.update.useMutation({
    onSuccess: () => {
      setLocation("/admin/posts");
    },
  });

  const uploadImageMutation = trpc.admin.posts.uploadImage.useMutation();

  // Fetch post data
  const { data: post, isLoading, error } = trpc.admin.posts.getById.useQuery(
    { id: postId! },
    { enabled: !!postId }
  );

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        subtitle: post.subtitle || "",
        content: post.content,
        category: post.category as any,
        author: post.author,
        imageUrl: post.imageUrl || "",
        published: post.published,
      });
    }
  }, [post]);

  if (!match) return null;

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-red-500">Erro ao carregar post: {error.message}</div>;
  }

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageLoading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve((event.target?.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const result = await uploadImageMutation.mutateAsync({
        filename: file.name,
        data: base64,
      });
      setFormData((prev) => ({ ...prev, imageUrl: result.url }));
    } finally {
      setImageLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postId) return;

    await updateMutation.mutateAsync({
      id: postId,
      title: formData.title,
      subtitle: formData.subtitle,
      content: formData.content,
      category: formData.category as any,
      author: formData.author,
      imageUrl: formData.imageUrl,
      published: formData.published,
    });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Editar Notícia</h1>
        <p className="text-muted-foreground">
          Edite os detalhes da notícia
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="bg-card text-card-foreground rounded-lg p-6 border border-border space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-2">Título *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 bg-input text-foreground rounded-lg border border-border focus:outline-none focus:border-accent"
              placeholder="Digite o título da notícia"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-semibold mb-2">Subtítulo</label>
            <input
              type="text"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-input text-foreground rounded-lg border border-border focus:outline-none focus:border-accent"
              placeholder="Digite o subtítulo (opcional)"
            />
          </div>

          {/* Category and Author */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Categoria *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-input text-foreground rounded-lg border border-border focus:outline-none focus:border-accent"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Autor *
              </label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-input text-foreground rounded-lg border border-border focus:outline-none focus:border-accent"
                placeholder="Nome do autor"
              />
            </div>
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Imagem de Capa
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-red-700 transition-colors font-semibold cursor-pointer">
                <Upload size={18} />
                {imageLoading ? "Enviando..." : "Selecionar Imagem"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={imageLoading}
                  className="hidden"
                />
              </label>
              {formData.imageUrl && (
                <div className="flex items-center gap-2">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, imageUrl: "" })
                    }
                    className="text-red-600 hover:text-red-700 font-semibold text-sm"
                  >
                    Remover
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Conteúdo *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required
              rows={12}
              className="w-full px-4 py-2 bg-input text-foreground rounded-lg border border-border focus:outline-none focus:border-accent font-mono text-sm"
              placeholder="Digite o conteúdo da notícia (suporta HTML)"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Você pode usar HTML para formatar o conteúdo
            </p>
          </div>

          {/* Publish checkbox */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="published"
              id="published"
              checked={formData.published}
              onChange={handleInputChange}
              className="w-4 h-4 rounded border-border"
            />
            <label htmlFor="published" className="font-semibold cursor-pointer">
              Publicada
            </label>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4 pt-4 border-t border-border">
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center gap-2 disabled:opacity-50"
              >
                {updateMutation.isPending && (
                  <Loader2 size={18} className="animate-spin" />
                )}
                {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </button>
              <button
                type="button"
                onClick={() => setLocation("/admin/posts")}
                className="px-6 py-3 bg-muted text-foreground rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Cancelar
              </button>
            </div>
            {updateMutation.isError && (
              <p className="text-red-600 text-sm font-medium">
                Erro ao salvar: {updateMutation.error?.message ?? "Tente novamente."}
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
