"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  MessageCircle,
  Plug,
  Tags as TagsIcon,
  SlidersHorizontal,
  Workflow,
  Send,
  Columns3,
} from "lucide-react";

const mainLinks = [
  { href: "/contatos", label: "Contatos", icon: Users },
  { href: "/automacoes", label: "Automações", icon: Workflow },
  { href: "/broadcasts", label: "Broadcasts", icon: Send },
  { href: "/crm", label: "CRM", icon: Columns3 },
  { href: "/conversas", label: "Live Chat", icon: MessageCircle },
  { href: "/conexoes", label: "Conexões", icon: Plug },
];

const settingsLinks = [
  { href: "/tags", label: "Tags", icon: TagsIcon },
  { href: "/campos-customizados", label: "Campos Customizados", icon: SlidersHorizontal },
];

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-sidebar-active text-white"
          : "text-sidebar-text-muted hover:bg-sidebar-bg-light hover:text-sidebar-text"
      }`}
    >
      <Icon size={18} />
      {label}
    </Link>
  );
}

export function Nav() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="flex w-60 shrink-0 flex-col gap-6 bg-sidebar-bg px-3 py-5 text-sidebar-text">
      <Link href="/" className="flex items-center px-2">
        <Image src="/chatnt-wordmark-white.svg" alt="ChatNT" width={126} height={42} className="h-9 w-auto" />
      </Link>

      <NavLink href="/" label="Início" icon={Home} active={pathname === "/"} />

      <nav className="flex flex-col gap-1">
        {mainLinks.map((link) => (
          <NavLink key={link.href} {...link} active={isActive(link.href)} />
        ))}
      </nav>

      <div className="flex flex-col gap-1">
        <p className="px-3 text-xs font-medium uppercase tracking-wide text-sidebar-text-muted">
          Configurações
        </p>
        {settingsLinks.map((link) => (
          <NavLink key={link.href} {...link} active={isActive(link.href)} />
        ))}
      </div>
    </aside>
  );
}
