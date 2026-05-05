import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, Upload, CheckCircle2, AlertCircle, Clock, Calendar } from "lucide-react";
import { CATEGORIES } from "@shared/const";
import { toast } from "sonner";

export default function AdminEditPost() {
  const [match, params] = useRoute("/posts/:id/edit");
  const [, setLocation] = useLocation();
  const postId = params?.id ? parseInt(params.id) : null;

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    content: "",
    category: CATEGORIES[0] as any,
    author: "",
    imageUrl: "",
    imageKey: "",
    published: false,
    publishedAt: new Date().toISOString().slice(0, 16),
  });

  const [isScheduled, setIsScheduled] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const updateMutation = trpc.admin.posts.update.useMutation({
    onSuccess: () => {
      toast.success("Alterações salvas!", {
        description: "A notícia foi atualizada com sucesso.",
        icon: <CheckCircle2 className="text-green-500" />
      });
      setLocation("/posts");
    },
    onError: (error) => {
      toast.error("Falha ao salvar", {
        description: error.message,
        icon: <AlertCircle className="text-red-500" />
      });
    }
  });

  const uploadImageMutation = trpc.admin.posts.uploadImage.useMutation();

  const { data: post, isLoading, error } = trpc.admin.posts.getById.useQuery(
    { id: postId! },
    { enabled: !!postId }
  );

  useEffect(() => {
    if (post) {
      const pubDate = post.publishedAt ? new Date(post.publishedAt) : new Date();
      setFormData({
        title: post.title,
        subtitle: post.subtitle || "",
        content: post.content,
        category: post.category as any,
        author: post.author,
        imageUrl: post.imageUrl || "",
        imageKey: post.imageKey || "",
        published: post.published,
        publishedAt: pubDate.toISOString().slice(0, 16),
      });
      
      // If the publishedAt is in the future, it's definitely scheduled
      if (post.publishedAt && new Date(post.publishedAt) > new Date()) {
        setIsScheduled(true);
      }
    }
  }, [post]);

  if (!match) return null;

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Erro ao carregar notícia</h2>
        <p className="text-muted-foreground">{error.message}</p>
      </div>
    );
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

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande", { description: "O limite é 5MB." });
      return;
    }

    setImageLoading(true);
    const uploadToast = toast.loading("Atualizando imagem...");
    
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
      toast.success("Imagem atualizada!", { id: uploadToast });
    } catch (err: any) {
      const errorMsg = err.message || "Erro desconhecido";
      toast.error("Erro no upload", { 
        id: uploadToast,
        description: `Detalhe: ${errorMsg}`
      });
      console.error("Upload error:", err);
    } finally {
      setImageLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postId) return;
    
    // If not explicitly scheduled via the UI toggle, we keep the original date 
    // unless it's a new publication toggle
    const finalData = {
      ...formData,
      publishedAt: isScheduled ? formData.publishedAt : formData.publishedAt 
    };

    await updateMutation.mutateAsync({ id: postId, ...finalData } as any);
  };

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 tracking-tight">Editar Notícia</h1>
        <p className="text-muted-foreground text-lg">
          Atualize os detalhes e mantenha seu público informado.
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
            />
          </div>

          {/* Category and Author */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">Categoria *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-muted/30 text-foreground rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-semibold"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">Autor *</label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-muted/30 text-foreground rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-semibold"
              />
            </div>
          </div>

          {/* Image upload */}
          <div className="p-6 bg-muted/20 rounded-2xl border border-dashed border-border">
            <label className="block text-sm font-bold mb-4 uppercase tracking-wider text-muted-foreground">Imagem de Capa</label>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <label className={`flex items-center gap-3 px-8 py-4 ${imageLoading ? 'bg-muted' : 'bg-accent'} text-white rounded-xl hover:scale-105 transition-all font-bold cursor-pointer shadow-lg shadow-accent/20`}>
                <Upload size={20} />
                {imageLoading ? "Subindo..." : "Trocar Imagem"}
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
                  <img src={formData.imageUrl} alt="Preview" className="w-40 h-24 object-cover rounded-lg ring-2 ring-accent" />
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
            <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">Corpo da Notícia *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required
              rows={15}
              className="w-full px-6 py-4 bg-muted/10 text-foreground rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-serif text-lg leading-relaxed"
            />
          </div>

          {/* Schedule / Publish Section */}
          <div className="p-6 bg-muted/20 rounded-2xl border border-border space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${!isScheduled ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                  {isScheduled ? <Clock size={24} /> : <CheckCircle2 size={24} />}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{isScheduled ? 'Agendamento Ativo' : 'Publicação Imediata'}</h3>
                  <p className="text-sm text-muted-foreground">Controle quando esta notícia deve ser exibida.</p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setIsScheduled(!isScheduled)}
                className="px-4 py-2 bg-white text-black border border-border rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
              >
                {isScheduled ? 'Mudar para Publicar Agora' : 'Alterar Agendamento'}
              </button>
            </div>

            {(isScheduled || (formData.publishedAt && new Date(formData.publishedAt) < new Date())) && (
              <div className="pt-4 border-t border-border/50 animate-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Calendar size={14} /> {isScheduled ? 'Agendado para:' : 'Publicado originalmente em:'}
                </label>
                <input
                  type="datetime-local"
                  name="publishedAt"
                  value={formData.publishedAt}
                  onChange={handleInputChange}
                  className="w-full md:w-fit px-4 py-3 bg-white text-black rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-bold"
                />
              </div>
            )}
            
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                name="published"
                id="published"
                checked={formData.published}
                onChange={handleInputChange}
                className="w-5 h-5 rounded accent-accent"
              />
              <label htmlFor="published" className="font-bold text-sm cursor-pointer select-none">
                {formData.published ? 'Ativar publicação (visível conforme data)' : 'Salvar apenas como Rascunho'}
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-border">
            <button
              type="submit"
              disabled={updateMutation.isPending || imageLoading}
              className="px-8 py-4 bg-accent text-white rounded-xl hover:bg-red-700 transition-all font-bold flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-accent/20 min-w-[200px]"
            >
              {updateMutation.isPending ? (
                <Loader2 size={20} className="animate-spin" />
              ) : <CheckCircle2 size={20} />}
              {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
            </button>
            <button
              type="button"
              onClick={() => setLocation("/posts")}
              className="px-8 py-4 bg-muted text-foreground rounded-xl hover:bg-border transition-all font-bold"
            >
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
