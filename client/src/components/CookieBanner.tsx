import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Link } from "wouter";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md z-50 animate-in slide-in-from-bottom-8 duration-500">
      <div className="bg-card border border-border shadow-2xl rounded-2xl p-6 relative">
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={18} />
        </button>
        
        <div className="pr-6">
          <h3 className="font-bold text-lg mb-2">Respeitamos sua privacidade 🍪</h3>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Utilizamos cookies para melhorar sua experiência, analisar o tráfego do site e personalizar o conteúdo de acordo com a <strong>LGPD</strong>. Ao navegar, você concorda com o uso de tecnologias de rastreamento.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button 
              onClick={acceptCookies}
              className="w-full py-2.5 bg-accent text-accent-foreground rounded-lg font-bold text-sm hover:bg-red-700 transition-colors shadow-lg shadow-accent/20"
            >
              Aceitar Todos
            </button>
            <Link href="/privacidade" className="w-full no-underline">
              <button className="w-full py-2.5 bg-muted text-foreground rounded-lg font-bold text-sm hover:bg-border transition-colors border border-border">
                Saiba Mais
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
