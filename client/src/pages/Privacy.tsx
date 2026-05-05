import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="Política de Privacidade" />
      <Header />

      <main className="flex-1 bg-background">
        <div className="container max-w-4xl py-12 px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 text-foreground">Política de Privacidade</h1>
            <div className="w-12 h-1 bg-accent rounded"></div>
          </div>

          <div className="space-y-6 text-foreground text-sm leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold mt-8 mb-4">1. Introdução e Base Legal</h2>
              <p>
                O Diário do Mundo está comprometido com a proteção de seus dados pessoais. Esta política foi elaborada em conformidade com a <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD)</strong>. Coletamos e processamos seus dados apenas quando temos uma base legal para fazê-lo, como consentimento, execução de contrato ou interesse legítimo.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mt-8 mb-4">2. Dados Coletados</h2>
              <p>
                Coletamos apenas o mínimo necessário para operar o portal:
              </p>
              <ul className="ml-4 space-y-2 mt-2">
                <li>• <strong>Dados de Login:</strong> Nome e e-mail via Google OAuth para identificar sua conta.</li>
                <li>• <strong>Dados de Contato:</strong> Nome, e-mail e conteúdo da mensagem enviados via formulário.</li>
                <li>• <strong>Dados de Acesso:</strong> Endereço IP (mascarado), tipo de dispositivo e páginas visitadas para fins estatísticos e segurança.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mt-8 mb-4">3. Finalidade do Tratamento</h2>
              <p>
                Seus dados são utilizados exclusivamente para:
              </p>
              <ul className="ml-4 space-y-2 mt-2">
                <li>• Gerenciar seu acesso ao portal e funcionalidades de "Minha Conta".</li>
                <li>• Responder a solicitações enviadas pelo canal de Contato.</li>
                <li>• Melhorar a performance e conteúdo do portal através de estatísticas anônimas.</li>
                <li>• Garantir a segurança contra ataques e acessos indevidos.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mt-8 mb-4">4. Seus Direitos (Art. 18 da LGPD)</h2>
              <p>
                Como titular dos dados, você tem direito a:
              </p>
              <ul className="ml-4 space-y-2 mt-2">
                <li>• Confirmação da existência de tratamento.</li>
                <li>• Acesso aos seus dados.</li>
                <li>• Correção de dados incompletos ou inexatos.</li>
                <li>• <strong>Eliminação de dados:</strong> Você pode excluir sua conta e dados a qualquer momento pelo menu "Minha Conta".</li>
                <li>• Revogação do consentimento.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mt-8 mb-4">5. Compartilhamento e Segurança</h2>
              <p>
                Não compartilhamos seus dados com terceiros para fins comerciais. Os dados são armazenados em servidores seguros com criptografia e protocolos de proteção rigorosos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mt-8 mb-4">6. Cookies e Publicidade</h2>
              <p>
                Utilizamos cookies para melhorar sua experiência e oferecer conteúdo personalizado. Além dos cookies técnicos de sessão, utilizamos serviços de terceiros, como o <strong>Google AdSense</strong>.
              </p>
              <ul className="ml-4 space-y-2 mt-2">
                <li>• O Google, como fornecedor de terceiros, utiliza cookies para exibir anúncios neste site.</li>
                <li>• Com o cookie DART, o Google pode exibir anúncios para você com base na sua visita a este e a outros sites na Internet.</li>
                <li>• Você pode desativar o cookie DART visitando a Política de Privacidade da rede de conteúdo e dos anúncios do Google.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mt-8 mb-4">7. Fornecedores de Terceiros</h2>
              <p>
                Terceiros, incluindo o Google, usam cookies para veicular anúncios com base em visitas anteriores do usuário ao seu website ou a outros websites. O uso de cookies de publicidade pelo Google permite que ele e seus parceiros veiculem anúncios para os usuários com base nas visitas a seus sites e/ou a outros sites na Internet.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mt-8 mb-4">7. Encarregado de Dados (DPO)</h2>
              <p>
                Para qualquer dúvida ou solicitação sobre seus dados pessoais, entre em contato através de nossa página de <a href="/contato" className="text-accent hover:underline">Contato</a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
