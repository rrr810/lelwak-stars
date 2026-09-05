import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * Public site shell.
 * The admin area (added later at src/app/(admin)) gets its own layout
 * without the marketing header/footer.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-forest-800 focus:px-5 focus:py-3 focus:font-display focus:text-sm focus:font-bold focus:text-white"
      >
        Skip to content
      </a>
      <Header />
      <div id="main" className="flex flex-1 flex-col">
        {children}
      </div>
      <Footer />
    </>
  );
}
