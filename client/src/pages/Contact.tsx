import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin } from "lucide-react";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would send this data to a backend
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen flex flex-col">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="flex gap-4">
              <Mail className="text-accent flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-foreground mb-1">Email</h3>
                <p className="text-muted-foreground">contato@diario-do-mundo.com.br</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Phone className="text-accent flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-foreground mb-1">Telefone</h3>
                <p className="text-muted-foreground">(11) 3000-0000</p>
              </div>
            </div>
            <div className="flex gap-4">
              <MapPin className="text-accent flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-foreground mb-1">Endereço</h3>
                <p className="text-muted-foreground">São Paulo, SP - Brasil</p>
              </div>
            </div>
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
                className="w-full px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Enviar Mensagem
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
