"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, User } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/search", label: "Search", icon: Search },
    { href: "/post", label: "Post", icon: PlusCircle },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-card border-t border-border pb-safe z-50 md:sticky md:top-0 md:w-64 md:h-screen md:border-r md:border-t-0 md:pb-0">
      <div className="flex justify-around items-center h-16 md:flex-col md:h-full md:justify-start md:pt-8 md:space-y-4">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                isActive ? "text-primary" : "text-card-foreground hover:text-primary"
              } md:flex-row md:w-full md:px-6 md:py-3`}
            >
              <Icon className="w-6 h-6 md:w-5 md:h-5 md:mr-3" />
              <span className="text-xs mt-1 md:text-base md:mt-0 font-medium">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
