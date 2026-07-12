import "./globals.css";

export const metadata = {
  title: "Wallpaper-chan",
  description: "Curate, discover, and share stunning wallpapers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-[family-name:var(--font-display)]">
        {children}
      </body>
    </html>
  );
}
