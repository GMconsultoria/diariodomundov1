import { Link, useLocation } from "wouter";
import { Mail, Loader2 } from "lucide-react";
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
          <p className="text-xl text-gray-300 leading-relaxed">
            A plataforma de notícias que conecta você com a verdade.
          </p>
        </div>
      </div>

      {/* Login Side */}
      <div className="flex-1 bg-background text-foreground flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8 animate-in slide-in-from-right-8 duration-700">
          <div className="text-center md:text-left">
            <Link href="/" className="md:hidden no-underline text-2xl font-black text-red-600 mb-8 block">
              DIÁRIO DO MUNDO
            </Link>
            <h2 className="text-3xl font-bold tracking-tight">Bem-vindo</h2>
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

            <p className="text-[10px] text-muted-foreground text-center mt-4 leading-relaxed">
              Ao entrar, você concorda com o processamento de seus dados (nome e e-mail) conforme nossa{" "}
              <Link href="/privacidade" className="text-accent hover:underline">
                Política de Privacidade
              </Link>{" "}
              (LGPD).
            </p>
          </div>

          {/* Footer Links */}
          <div className="pt-6 border-t border-border">
            <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2">
              <Link href="/sobre" className="text-xs text-muted-foreground hover:text-accent transition-colors no-underline">
                Sobre Nós
              </Link>
              <Link href="/privacidade" className="text-xs text-muted-foreground hover:text-accent transition-colors no-underline">
                Política de Privacidade
              </Link>
              <Link href="/termos" className="text-xs text-muted-foreground hover:text-accent transition-colors no-underline">
                Termos de Uso
              </Link>
              <Link href="/contato" className="text-xs text-muted-foreground hover:text-accent transition-colors no-underline">
                Contato
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
