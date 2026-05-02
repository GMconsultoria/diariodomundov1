import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { CATEGORIES } from "@shared/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function AdminCreatePost() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    content: "",
    category: CATEGORIES[0],
    author: "",
    imageUrl: "",
    imageKey: "",
    published: false,
  });

  // Auto-fill author from logged-in user
  useEffect(() => {
    if (user?.name && !formData.author) {
      setFormData(prev => ({ ...prev, author: user.name || "" }));
    }
  }, [user]);

  const [imageLoading, setImageLoading] = useState(false);
  
  const createMutation = trpc.admin.posts.create.useMutation({
    onSuccess: () => {
      toast.success("Notícia publicada com sucesso!", {
        description: "O conteúdo já está disponível no portal.",
        icon: <CheckCircle2 className="text-green-500" />
      });
      setLocation("/posts");
    },
    onError: (error) => {
      toast.error("Erro ao criar notícia", {
        description: error.message,
        icon: <AlertCircle className="text-red-500" />
      });
    }
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

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande", { description: "O tamanho máximo permitido é 5MB." });
      return;
    }

    setImageLoading(true);
    const uploadToast = toast.loading("Enviando imagem...");
    
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
      
      setFormData((prev) => ({ ...prev, imageUrl: result.url, imageKey: result.key }));
      toast.success("Imagem enviada!", { id: uploadToast });
    } catch (err) {
      toast.error("Erro no upload", { id: uploadToast });
    } finally {
      setImageLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content || formData.content.length < 20) {
      toast.warning("Conteúdo muito curto", { description: "Escreva um pouco mais para seus leitores." });
      return;
    }
    await createMutation.mutateAsync(formData as any);
  };

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 tracking-tight">Nova Notícia</h1>
        <p className="text-muted-foreground text-lg">
          Compouse seu conteúdo e publique para milhares de leitores.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-5xl">
        <div className="bg-card text-card-foreground rounded-2xl p-8 border border-border shadow-xl space-y-8">
          {/* Title */}
          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">Título da Matéria *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-muted/30 text-foreground rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-lg font-bold"
              placeholder="Digite um título impactante..."
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">Linha de Apoio (Subtítulo)</label>
            <textarea
              name="subtitle"
              value={formData.subtitle}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-4 py-3 bg-muted/30 text-foreground rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="Um resumo curto do que a notícia trata..."
            />
          </div>

          {/* Category and Author */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">
                Categoria *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-muted/30 text-foreground rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-semibold"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">
                Autor *
              </label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-muted/30 text-foreground rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-semibold"
                placeholder="Nome do jornalista"
              />
            </div>
          </div>

          {/* Image upload */}
          <div className="p-6 bg-muted/20 rounded-2xl border border-dashed border-border">
            <label className="block text-sm font-bold mb-4 uppercase tracking-wider text-muted-foreground">
              Imagem de Capa (Proporção 16:9 recomendada)
            </label>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <label className={`flex items-center gap-3 px-8 py-4 ${imageLoading ? 'bg-muted' : 'bg-accent'} text-white rounded-xl hover:scale-105 transition-all font-bold cursor-pointer shadow-lg shadow-accent/20`}>
                <Upload size={20} />
                {imageLoading ? "Subindo imagem..." : "Selecionar do Computador"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={imageLoading}
                  className="hidden"
                />
              </label>
              
              {formData.imageUrl && (
                <div className="relative group">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-40 h-24 object-cover rounded-lg ring-2 ring-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, imageUrl: "", imageKey: "" })}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-lg hover:bg-red-700"
                  >
                    <AlertCircle size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">
              Corpo da Notícia (Suporta HTML) *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required
              rows={15}
              className="w-full px-6 py-4 bg-muted/10 text-foreground rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-serif text-lg leading-relaxed"
              placeholder="Era uma vez no Diário do Mundo..."
            />
            <div className="flex gap-4 mt-2">
               <p className="text-xs text-muted-foreground">Dica: Use &lt;p&gt; para parágrafos e &lt;h2&gt; para subtítulos.</p>
            </div>
          </div>

          {/* Publish Toggle */}
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl w-fit">
            <input
              type="checkbox"
              name="published"
              id="published"
              checked={formData.published}
              onChange={handleInputChange}
              className="w-5 h-5 rounded accent-accent"
            />
            <label htmlFor="published" className="font-bold text-sm cursor-pointer select-none">
              Publicar imediatamente no portal
            </label>
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-border">
            <button
              type="submit"
              disabled={createMutation.isPending || imageLoading}
              className="px-8 py-4 bg-accent text-white rounded-xl hover:bg-red-700 transition-all font-bold flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-accent/20 min-w-[200px]"
            >
              {createMutation.isPending ? (
                <Loader2 size={20} className="animate-spin" />
              ) : <CheckCircle2 size={20} />}
              {createMutation.isPending ? "Processando..." : "Finalizar e Publicar"}
            </button>
            <button
              type="button"
              onClick={() => setLocation("/posts")}
              className="px-8 py-4 bg-muted text-foreground rounded-xl hover:bg-border transition-all font-bold"
            >
              Descartar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
