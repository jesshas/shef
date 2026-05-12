import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-rose/20 bg-cream py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-serif text-2xl tracking-tighter text-espresso">shef</span>
        </div>
        <p className="text-sm text-espresso/50 font-sans text-center">
          © MoveClub Inc., LLC
        </p>
        <div className="flex items-center gap-4 text-sm text-espresso/50 font-sans">
          <Link href="/plan/new" className="hover:text-espresso transition-colors">
            Start Planning
          </Link>
          <a
            href="https://github.com/jesshas/shef"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-espresso transition-colors"
          >
            Contribute
          </a>
          <a
            href="mailto:hello@joinmoveclub.com"
            className="hover:text-espresso transition-colors"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
