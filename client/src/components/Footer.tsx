import { Link } from "wouter";
import { CATEGORIES } from "@shared/const";
import { getCategoryLink } from "@/lib/categoryUtils";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-accent">Diário do Mundo</h3>
            <p className="text-sm text-gray-300">
              Portal de notícias independente com cobertura completa de política, economia, tecnologia e muito mais.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-bold mb-4 uppercase">Categorias</h4>
            <ul className="space-y-2 text-sm">
              {CATEGORIES.map(category => (
                <li key={category}>
                  <Link href={getCategoryLink(category)} className="no-underline text-gray-300 hover:text-accent transition-colors">
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-bold mb-4 uppercase">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/sobre" className="no-underline text-gray-300 hover:text-accent transition-colors">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="no-underline text-gray-300 hover:text-accent transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/termos" className="no-underline text-gray-300 hover:text-accent transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/contato" className="no-underline text-gray-300 hover:text-accent transition-colors">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-bold mb-4 uppercase">Redes Sociais</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="no-underline text-gray-300 hover:text-accent transition-colors">
                  Facebook
                </a>
              </li>
              <li>
                <a href="#" className="no-underline text-gray-300 hover:text-accent transition-colors">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="no-underline text-gray-300 hover:text-accent transition-colors">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className="no-underline text-gray-300 hover:text-accent transition-colors">
                  YouTube
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-gray-400">
            © {currentYear} Diário do Mundo. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
