import { trpc } from "@/lib/trpc";
import { Loader2, Mail, MailOpen, Calendar, User, Tag, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminMessages() {
  const { data: messages, isLoading, refetch } = trpc.contact.getAll.useQuery();
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  const markAsReadMutation = trpc.contact.markAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleOpenMessage = (msg: any) => {
    setSelectedMessage(msg);
    if (!msg.read) {
      markAsReadMutation.mutate({ id: msg.id });
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-bold mb-2">Mensagens</h1>
        <p className="text-muted-foreground">Mensagens recebidas via formulário de contato</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Messages List */}
        <div className="lg:col-span-1 bg-card rounded-xl border border-border overflow-hidden shadow-sm flex flex-col h-[600px]">
          <div className="p-4 bg-muted/50 border-b border-border font-bold text-sm uppercase tracking-wider flex items-center gap-2">
            <Mail size={16} /> Inbox
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {!messages || messages.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground italic text-sm">
                Nenhuma mensagem recebida.
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => handleOpenMessage(msg)}
                  className={`p-4 cursor-pointer transition-colors hover:bg-muted/30 relative ${
                    selectedMessage?.id === msg.id ? "bg-muted/50 border-l-4 border-accent" : ""
                  } ${!msg.read ? "font-bold bg-accent/5" : ""}`}
                >
                  {!msg.read && (
                    <div className="absolute top-4 right-4 w-2 h-2 bg-accent rounded-full shadow-sm shadow-accent/50" />
                  )}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm truncate flex-1">{msg.name}</span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {new Date(msg.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{msg.subject}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-sm h-[600px] flex flex-col">
          {selectedMessage ? (
            <div className="flex flex-col h-full animate-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 border-b border-border space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{selectedMessage.subject}</h2>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <User size={14} className="text-accent" />
                        <span className="font-semibold text-foreground">{selectedMessage.name}</span>
                        <span>&lt;{selectedMessage.email}&gt;</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {new Date(selectedMessage.createdAt).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 p-8 overflow-y-auto">
                <div className="bg-muted/30 p-6 rounded-xl border border-border whitespace-pre-wrap text-foreground leading-relaxed">
                  {selectedMessage.message}
                </div>
              </div>
              <div className="p-4 border-t border-border flex justify-end gap-3">
                <a 
                  href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                  className="px-6 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-red-700 transition-colors font-bold text-sm no-underline"
                >
                  Responder por E-mail
                </a>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-12 text-center">
              <div className="bg-muted p-6 rounded-full mb-4">
                <MailOpen size={48} className="opacity-20" />
              </div>
              <p className="text-lg font-semibold">Selecione uma mensagem</p>
              <p className="text-sm max-w-xs mt-1">
                Escolha uma mensagem na lista ao lado para ler o conteúdo completo.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
