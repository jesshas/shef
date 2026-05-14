import Link from "next/link";

interface SignUpGateProps {
  isLoggedIn: boolean;
  children: React.ReactNode;
  /** Path to redirect back to after sign-in / sign-up */
  returnTo?: string;
}

/**
 * Wraps content with a blur overlay and sign-up CTA for unauthenticated viewers
 * of shared pages. Logged-in users see the content normally.
 */
export function SignUpGate({ isLoggedIn, children, returnTo }: SignUpGateProps) {
  if (isLoggedIn) return <>{children}</>;

  const signInHref = returnTo
    ? `/sign-in?redirect_url=${encodeURIComponent(returnTo)}`
    : "/sign-in";
  const signUpHref = returnTo
    ? `/sign-up?redirect_url=${encodeURIComponent(returnTo)}`
    : "/sign-up";

  return (
    <div className="relative">
      {/* Blurred content preview */}
      <div className="blur-sm pointer-events-none select-none" aria-hidden="true">
        {children}
      </div>

      {/* Gradient fade + CTA card */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-cream/70 to-cream" />
        <div className="relative z-10 bg-cream border border-rose/30 rounded-2xl px-8 py-10 shadow-lg text-center mx-4 max-w-xs w-full">
          <p className="text-[11px] font-sans font-semibold text-espresso/40 uppercase tracking-wider mb-3">
            Free account required
          </p>
          <h2 className="font-serif tracking-tighter text-2xl text-espresso mb-2">
            Save and plan with shef
          </h2>
          <p className="text-sm text-espresso/60 font-sans mb-6 leading-relaxed">
            Create a free account to save recipes, build grocery lists, and plan your week.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href={signUpHref}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-espresso text-cream text-sm font-sans font-medium hover:bg-espresso/80 transition-colors"
            >
              Create free account
            </Link>
            <Link
              href={signInHref}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-espresso/20 text-espresso text-sm font-sans hover:bg-espresso/5 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
