"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { LayoutDashboard, BookOpen, Settings, Sparkles, Menu, X, ShoppingCart } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { isSignedIn } = useUser();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-rose/20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-serif tracking-tighter text-2xl text-espresso group-hover:text-espresso-light transition-colors">
              shef
            </span>
          </Link>

          {/* Nav links (signed in) — desktop */}
          {isSignedIn && (
            <div className="hidden md:flex items-center gap-1">
              <NavLink href="/dashboard" icon={<LayoutDashboard size={15} />} active={pathname === "/dashboard"}>
                Dashboard
              </NavLink>
              <NavLink href="/recipes" icon={<BookOpen size={15} />} active={pathname === "/recipes"}>
                Recipes
              </NavLink>
              <NavLink href="/settings" icon={<Settings size={15} />} active={pathname === "/settings"}>
                Settings
              </NavLink>
            </div>
          )}

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/plan/new"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-espresso text-cream text-sm font-sans font-medium rounded-xl hover:bg-espresso-light transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <Sparkles size={14} />
              Plan My Week
            </Link>
            {isSignedIn ? (
              <>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8 ring-2 ring-rose/40",
                    },
                  }}
                />
                <button
                  className="md:hidden p-2 rounded-lg text-espresso/70 hover:text-espresso hover:bg-linen transition-colors"
                  onClick={() => setMobileOpen((o) => !o)}
                  aria-label="Toggle menu"
                >
                  {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </>
            ) : (
              <Link
                href="/sign-in"
                className="text-sm font-sans text-espresso/70 hover:text-espresso transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {isSignedIn && mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 flex flex-col">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-espresso/20 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute top-16 left-0 right-0 bg-cream border-b border-rose/20 shadow-lg px-4 py-4 space-y-1">
            <MobileNavLink
              href="/dashboard"
              icon={<LayoutDashboard size={17} />}
              active={pathname === "/dashboard"}
              onClick={() => setMobileOpen(false)}
            >
              Dashboard
            </MobileNavLink>
            <MobileNavLink
              href="/recipes"
              icon={<BookOpen size={17} />}
              active={pathname === "/recipes"}
              onClick={() => setMobileOpen(false)}
            >
              Recipes
            </MobileNavLink>
            <MobileNavLink
              href="/dashboard"
              icon={<ShoppingCart size={17} />}
              active={false}
              onClick={() => setMobileOpen(false)}
            >
              My Lists
            </MobileNavLink>
            <MobileNavLink
              href="/settings"
              icon={<Settings size={17} />}
              active={pathname === "/settings"}
              onClick={() => setMobileOpen(false)}
            >
              Settings
            </MobileNavLink>
            <div className="pt-2 border-t border-rose/10">
              <Link
                href="/plan/new"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-espresso text-cream text-sm font-sans font-medium rounded-xl"
              >
                <Sparkles size={15} />
                Plan My Week
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function NavLink({
  href,
  icon,
  active,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-1.5 px-3 py-2 text-sm font-sans font-medium rounded-lg transition-colors",
        active
          ? "bg-linen text-espresso"
          : "text-espresso/60 hover:text-espresso hover:bg-linen/60",
      ].join(" ")}
    >
      {icon}
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  icon,
  active,
  onClick,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={[
        "flex items-center gap-3 px-4 py-3 text-sm font-sans font-medium rounded-xl transition-colors",
        active
          ? "bg-linen text-espresso"
          : "text-espresso/70 hover:text-espresso hover:bg-linen/60",
      ].join(" ")}
    >
      {icon}
      {children}
    </Link>
  );
}

