import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, Upload } from "lucide-react";

const CATEGORIES = ["Política", "Economia", "Investimentos", "Ciência e Tecnologia", "Curiosidade"];

export default function AdminCreatePost() {
  const [, setLocation] = useLocation();
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
  const createMutation = trpc.admin.posts.create.useMutation({
    onSuccess: () => {
      setLocation("/admin/posts");
    },
  });

  const uploadImageMutation = trpc.admin.posts.uploadImage.useMutation();

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
    await createMutation.mutateAsync({
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
        <h1 className="text-4xl font-bold mb-2">Nova Notícia</h1>
        <p className="text-muted-foreground">
          Crie uma nova notícia para o portal
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
              Publicar agora
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-border">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              {createMutation.isPending && (
                <Loader2 size={18} className="animate-spin" />
              )}
              {createMutation.isPending ? "Salvando..." : "Salvar Notícia"}
            </button>
            <button
              type="button"
              onClick={() => setLocation("/admin/posts")}
              className="px-6 py-3 bg-muted text-foreground rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
