import Link from "next/link";
import { Gavel } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-brand-dark text-white print:hidden">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
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
            Seu painel pessoal para acompanhar imóveis de leilão, do interesse à arrematação.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white/90">Painel</h4>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li><Link href="/painel?tab=meus-imoveis" className="hover:text-white">Meus Imóveis</Link></li>
            <li><Link href="/painel?tab=calculadora" className="hover:text-white">Calculadora de Viabilidade</Link></li>
            <li><Link href="/painel?tab=carteira" className="hover:text-white">Carteira</Link></li>
            <li><Link href="/como-funciona" className="hover:text-white">Como Funciona</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white/90">Sobre</h4>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li><Link href="/sobre" className="hover:text-white">Sobre</Link></li>
            <li><Link href="/contato" className="hover:text-white">Contato</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Radar Leilões — ferramenta pessoal de gestão de leilões.
      </div>
    </footer>
  );
}
