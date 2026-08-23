import Link from "next/link";
import { Camera, Gavel, Link2, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-brand-dark text-white print:hidden">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2 font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
              <Gavel size={18} />
            </span>
            <span className="text-lg tracking-tight">
              Radar <span className="text-accent">Leilões</span>
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-white/70">
            Agregamos e analisamos leilões de imóveis em todo o Brasil para você encontrar
            oportunidades reais, com transparência e dados.
          </p>
          <div className="mt-4 flex gap-3">
            <a href="#" aria-label="Instagram" className="rounded-full bg-white/10 p-2 hover:bg-white/20">
              <Camera size={16} />
            </a>
            <a href="#" aria-label="LinkedIn" className="rounded-full bg-white/10 p-2 hover:bg-white/20">
              <Link2 size={16} />
            </a>
            <a href="#" aria-label="WhatsApp" className="rounded-full bg-white/10 p-2 hover:bg-white/20">
              <MessageCircle size={16} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white/90">Plataforma</h4>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li><Link href="/buscar" className="hover:text-white">Buscar Imóveis</Link></li>
            <li><Link href="/como-funciona" className="hover:text-white">Como Funciona</Link></li>
            <li><Link href="/buscar" className="hover:text-white">Calculadora de Viabilidade</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white/90">Empresa</h4>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li><Link href="/sobre" className="hover:text-white">Sobre Nós</Link></li>
            <li><Link href="/contato" className="hover:text-white">Contato</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white/90">Fontes de Leilão</h4>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li>Caixa Econômica Federal</li>
            <li>Santander, Itaú, Bradesco</li>
            <li>Leiloeiros parceiros</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Radar Leilões — Todos os direitos reservados. Dados de leilões públicos, sujeitos a alteração pelos leiloeiros oficiais.
      </div>
    </footer>
  );
}
