import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { Shield, Mail, ArrowRight, Loader2, FileText as FileTextIcon } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect } from "react";

export default function Login() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  const API_BASE_URL = import.meta.env.VITE_API_URL || "";
  const loginUrl = `${API_BASE_URL}/api/auth/login?returnTo=/`;

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row overflow-hidden">
      {/* Visual Side */}
      <div className="hidden md:flex flex-1 relative bg-red-900/20 items-center justify-center p-12">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070')] bg-cover bg-center opacity-30" />
        <div className="relative z-10 max-w-lg">
          <h1 className="text-6xl font-black mb-6 leading-tight">
            DIÁRIO DO <span className="text-red-600 underline">MUNDO</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            A plataforma de notícias que conecta você com a verdade. Junte-se à nossa equipe de redatores ou acompanhe as métricas em tempo real.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
              <h3 className="font-bold text-red-500 mb-1">REDATORES</h3>
              <p className="text-xs text-gray-400">Publique e gerencie suas notícias de forma intuitiva.</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
              <h3 className="font-bold text-red-500 mb-1">MÉTRICAS</h3>
              <p className="text-xs text-gray-400">Acompanhe audiência e visualizações em tempo real.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Login Side */}
      <div className="flex-1 bg-background text-foreground flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8 animate-in slide-in-from-right-8 duration-700">
          <div className="text-center md:text-left">
            <Link href="/" className="md:hidden no-underline text-2xl font-black text-red-600 mb-8 block">
              DIÁRIO DO MUNDO
            </Link>
            <h2 className="text-3xl font-bold tracking-tight">Bem-vindo de volta</h2>
            <p className="text-muted-foreground mt-2">Escolha seu método de acesso para continuar</p>
          </div>

          <div className="space-y-4 pt-4">
            {/* Google Login Button */}
            <a 
              href={loginUrl}
              className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-white text-black border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all transform hover:-translate-y-1 shadow-md no-underline"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              Entrar com Google
            </a>

            <button 
              disabled
              className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-muted text-muted-foreground border border-border rounded-xl font-bold opacity-50 cursor-not-allowed"
            >
              <Mail size={20} />
              Entrar com E-mail
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground font-medium">Informação de Cargos</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-default">
              <Shield className="text-accent mt-0.5" size={18} />
              <div>
                <p className="text-sm font-bold">Administrador</p>
                <p className="text-xs text-muted-foreground">Controle total, métricas e gestão de usuários.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-default">
              <FileTextIcon className="text-accent mt-0.5" size={18} />
              <div>
                <p className="text-sm font-bold">Redator</p>
                <p className="text-xs text-muted-foreground">Acesso ao módulo de notícias e publicação.</p>
              </div>
            </div>
          </div>

          <div className="pt-8 text-center border-t border-border">
            <Link href="/" className="text-sm font-bold text-accent hover:underline flex items-center justify-center gap-2">
              Voltar para a Home do Diário <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
