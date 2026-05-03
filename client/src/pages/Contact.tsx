import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const submitMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      toast.success("Mensagem enviada!", {
        description: "Agradecemos o contato. Responderemos em breve.",
      });
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSubmitted(false), 5000);
    },
    onError: (err) => {
      toast.error("Erro ao enviar mensagem: " + err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="Contato" />
      <Header />

      <main className="flex-1 bg-background">
        <div className="container max-w-4xl py-12 px-4">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4 text-foreground">Entre em Contato</h1>
            <div className="w-12 h-1 bg-accent rounded"></div>
            <p className="text-muted-foreground mt-4">
              Tem alguma sugestão, dúvida ou quer entrar em contato? Preencha o formulário abaixo e nos envie uma mensagem.
            </p>
          </div>


          <div className="bg-card text-card-foreground rounded-lg p-8 border border-border">
            {submitted && (
              <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg">
                Obrigado! Sua mensagem foi enviada com sucesso. Entraremos em contato em breve.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Nome *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-input text-foreground rounded-lg border border-border focus:outline-none focus:border-accent"
                  placeholder="Seu nome"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-input text-foreground rounded-lg border border-border focus:outline-none focus:border-accent"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Assunto *</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-input text-foreground rounded-lg border border-border focus:outline-none focus:border-accent"
                  placeholder="Assunto da mensagem"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Mensagem *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-2 bg-input text-foreground rounded-lg border border-border focus:outline-none focus:border-accent"
                  placeholder="Sua mensagem..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitMutation.isPending}
                className="w-full py-4 bg-accent text-accent-foreground rounded-lg hover:bg-red-700 transition-all font-bold shadow-lg shadow-accent/20 disabled:opacity-50"
              >
                {submitMutation.isPending ? "Enviando..." : "Enviar Mensagem"}
              </button>

              <p className="text-[10px] text-muted-foreground text-center mt-4">
                Ao enviar esta mensagem, você concorda com o processamento de seus dados pessoais para fins de resposta, conforme nossa <Link href="/privacidade" className="text-accent hover:underline">Política de Privacidade</Link> (LGPD).
              </p>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
