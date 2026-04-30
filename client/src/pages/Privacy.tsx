import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-background">
        <div className="container max-w-4xl py-12 px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 text-foreground">Política de Privacidade</h1>
            <div className="w-12 h-1 bg-accent rounded"></div>
          </div>

          <div className="space-y-6 text-foreground text-sm leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold mt-8 mb-4">1. Introdução</h2>
              <p>
                O Diário do Mundo ("nós", "nosso" ou "nos") opera o site diario-do-mundo.com.br (o "Site"). Esta página informa você sobre nossas políticas sobre a coleta, uso e divulgação de dados pessoais quando você usa nosso Site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mt-8 mb-4">2. Coleta de Dados</h2>
              <p>
                Coletamos dados pessoais que você nos fornece voluntariamente, como seu nome e endereço de e-mail quando você se registra ou entra em contato conosco. Também coletamos dados automaticamente sobre sua visita ao Site, incluindo seu endereço IP, tipo de navegador e páginas visitadas.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mt-8 mb-4">3. Uso de Dados</h2>
              <p>
                Usamos os dados que coletamos para:
              </p>
              <ul className="ml-4 space-y-2 mt-2">
                <li>• Fornecer e melhorar nossos serviços</li>
                <li>• Enviar comunicações sobre atualizações e ofertas</li>
                <li>• Responder a suas consultas e solicitações</li>
                <li>• Analisar o uso do Site para melhorar a experiência do usuário</li>
                <li>• Cumprir obrigações legais</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mt-8 mb-4">4. Compartilhamento de Dados</h2>
              <p>
                Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros, exceto quando exigido por lei ou com seu consentimento explícito.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mt-8 mb-4">5. Segurança de Dados</h2>
              <p>
                Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados pessoais contra acesso não autorizado, alteração, divulgação ou destruição.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mt-8 mb-4">6. Seus Direitos</h2>
              <p>
                Você tem o direito de acessar, corrigir ou deletar seus dados pessoais. Para exercer esses direitos, entre em contato conosco através da página de contato.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mt-8 mb-4">7. Mudanças nesta Política</h2>
              <p>
                Podemos atualizar esta Política de Privacidade periodicamente. Recomendamos que você revise esta página regularmente para se manter informado sobre como protegemos seus dados.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mt-8 mb-4">8. Contato</h2>
              <p>
                Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco através da página de contato.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
