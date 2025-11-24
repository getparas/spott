import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import Header from "@/components/header";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "Spott",
  description: "Discover and create amazing events",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`bg-linear-to-br from-gray-950 via-zinc-900 to-stone-900 text-white`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider
            appearance={{
              theme: dark,
            }}
          >
            <ConvexClientProvider>
              <Header />
              <main className="relative container mx-auto min-h-screen pt-40 md:pt-32">
                {/* glow*/}
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                  <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-pink-600/20 blur-3xl" />
                  <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-orange-600/20 blur-3xl" />
                </div>
                <div className="relative z-10 min-h-[70vh]">{children}</div>
                <footer className="mx-auto max-w-7xl border-t border-gray-800/50 px-6 py-8">
                  <span className="text-sm text-gray-500">
                    Made with ❤️ by syntax
                  </span>
                </footer>
                <Toaster richColors />
              </main>
            </ConvexClientProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
