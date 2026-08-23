"use client";

import { FormEvent, useState } from "react";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

export default function ContatoPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-foreground">Fale conosco</h1>
      <p className="mt-2 text-muted">
        Dúvidas sobre um imóvel específico ou sobre nossa assessoria completa? Preencha o
        formulário ou fale direto pelo WhatsApp.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
            <MessageCircle className="mt-0.5 text-brand" size={18} />
            <div>
              <p className="text-sm font-semibold text-foreground">WhatsApp</p>
              <p className="text-sm text-muted">(12) 99999-0000</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
            <Mail className="mt-0.5 text-brand" size={18} />
            <div>
              <p className="text-sm font-semibold text-foreground">E-mail</p>
              <p className="text-sm text-muted">contato@radarleiloes.com.br</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
            <Phone className="mt-0.5 text-brand" size={18} />
            <div>
              <p className="text-sm font-semibold text-foreground">Telefone</p>
              <p className="text-sm text-muted">(12) 3000-0000</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
            <MapPin className="mt-0.5 text-brand" size={18} />
            <div>
              <p className="text-sm font-semibold text-foreground">Escritório</p>
              <p className="text-sm text-muted">São José dos Campos, SP</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {sent ? (
            <div className="rounded-xl border border-success/30 bg-success-bg p-6 text-success">
              <p className="font-semibold">Mensagem registrada!</p>
              <p className="mt-1 text-sm">
                Este é um formulário de demonstração — nenhuma mensagem foi enviada de verdade
                ainda. Em produção, conecte-o a um endpoint de e-mail ou CRM.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Nome</label>
                <input required className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">E-mail</label>
                <input required type="email" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-muted">Telefone / WhatsApp</label>
                <input className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-muted">Mensagem</label>
                <textarea required rows={4} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
              </div>
              <button
                type="submit"
                className="sm:col-span-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Enviar mensagem
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
