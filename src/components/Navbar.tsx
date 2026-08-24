"use client";

import Link from "next/link";
import { useState } from "react";
import { Gavel, Menu, X } from "lucide-react";

const LINKS = [
  { href: "/painel?tab=meus-imoveis", label: "Meus Imóveis" },
  { href: "/painel?tab=calculadora", label: "Calculadora" },
  { href: "/painel?tab=carteira", label: "Carteira" },
  { href: "/noticias", label: "Notícias" },
  { href: "/como-funciona", label: "Como Funciona" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold text-brand">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white">
            <Gavel size={18} />
          </span>
          <span className="text-lg tracking-tight">
            Radar <span className="text-accent">Leilões</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium text-foreground/80 hover:text-brand">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/painel?tab=meus-imoveis"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            Ir para o painel
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Abrir menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-border bg-card px-4 py-3 md:hidden">
          <ul className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted-bg"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/painel?tab=meus-imoveis"
                onClick={() => setOpen(false)}
                className="mt-2 block rounded-lg bg-brand px-3 py-2 text-center text-sm font-semibold text-white"
              >
                Ir para o painel
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
