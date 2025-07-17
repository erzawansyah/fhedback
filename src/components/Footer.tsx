import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t-4 border-border bg-main">
      <div className="container mx-auto flex items-center justify-between py-4 px-2">
        <div className="flex gap-6 items-center">
          <Link
            href="/about"
            className="px-3 py-1 rounded-lg border-2 border-border bg-secondary-background shadow-sm font-bold hover:bg-foreground hover:text-yellow transition-colors duration-200"
          >
            About
          </Link>
          <a
            href="https://docs.fhe-survey.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 rounded-lg border-2 border-border bg-secondary-background shadow-sm font-bold hover:bg-foreground hover:text-yellow transition-colors duration-200"
          >
            Documentation
          </a>
          <a
            href="https://litepaper.fhe-survey.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 rounded-lg border-2 border-border bg-secondary-background shadow-sm font-bold hover:bg-foreground hover:text-yellow transition-colors duration-200"
          >
            Litepaper
          </a>
        </div>
        <div className="flex gap-4 items-center">
          <a
            href="https://github.com/fhe-survey"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-2xl border-2 border-border bg-secondary-background rounded-full p-2 shadow-sm hover:bg-foreground hover:text-yellow transition-colors duration-200"
          >
            🐙
          </a>
          <a
            href="https://twitter.com/fhe-survey"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="text-2xl border-2 border-border bg-secondary-background rounded-full p-2 shadow-sm hover:bg-foreground hover:text-yellow transition-colors duration-200"
          >
            🐦
          </a >
          <a
            href="https://discord.gg/fhe-survey"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Discord"
            className="text-2xl border-2 border-border bg-secondary-background rounded-full p-2 shadow-sm hover:bg-foreground hover:text-yellow transition-colors duration-200"
          >
            💬
          </a >
        </div >
      </div >
    </footer >
  );
}
