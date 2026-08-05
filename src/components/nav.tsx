import Link from "next/link";

const links = [
  { href: "/conversas", label: "Conversas" },
  { href: "/contatos", label: "Contatos" },
  { href: "/tags", label: "Tags" },
  { href: "/campos-customizados", label: "Campos Customizados" },
  { href: "/conexoes", label: "Conexões" },
];

export function Nav() {
  return (
    <header className="border-b border-black/10 dark:border-white/15">
      <div className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-4">
        <span className="font-semibold">CRM Unichaat</span>
        <nav className="flex gap-4 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-foreground/70 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
