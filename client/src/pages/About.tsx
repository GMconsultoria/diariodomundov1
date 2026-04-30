import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "wouter";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-background">
        <div className="container max-w-4xl py-12 px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 text-foreground">Sobre Nós</h1>
            <div className="w-12 h-1 bg-accent rounded"></div>
          </div>

          <div className="space-y-6 text-foreground">
            <p className="text-lg leading-relaxed">
              O <strong>Diário do Mundo</strong> é um portal de notícias independente dedicado a trazer informações de qualidade, precisas e atualizadas sobre os principais acontecimentos políticos, econômicos, tecnológicos e culturais do Brasil e do mundo.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Nossa Missão</h2>
            <p className="leading-relaxed">
              Fornecer jornalismo de excelência, comprometido com a verdade, a imparcialidade e o interesse público. Acreditamos que a informação de qualidade é fundamental para uma sociedade democrática e bem-informada.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Nossos Valores</h2>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-accent font-bold">•</span>
                <span><strong>Integridade:</strong> Comprometimento com a verdade e a ética jornalística</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-bold">•</span>
                <span><strong>Independência:</strong> Cobertura imparcial e livre de influências políticas</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-bold">•</span>
                <span><strong>Qualidade:</strong> Conteúdo bem pesquisado e verificado</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-bold">•</span>
                <span><strong>Acessibilidade:</strong> Informação disponível e compreensível para todos</span>
              </li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">Categorias de Cobertura</h2>
            <p className="leading-relaxed">
              Cobrimos as principais áreas de interesse público:
            </p>
            <ul className="space-y-2 ml-4">
              <li>• <strong>Política:</strong> Notícias sobre política nacional e internacional</li>
              <li>• <strong>Economia:</strong> Análises econômicas e de mercado</li>
              <li>• <strong>Investimentos:</strong> Oportunidades e tendências de investimento</li>
              <li>• <strong>Ciência e Tecnologia:</strong> Inovações e descobertas científicas</li>
              <li>• <strong>Curiosidade:</strong> Histórias interessantes e inusitadas</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">Contato</h2>
            <p className="leading-relaxed">
              Tem alguma sugestão, dúvida ou quer entrar em contato? Visite nossa página de <Link href="/contato" className="text-accent hover:underline">contato</Link>.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
