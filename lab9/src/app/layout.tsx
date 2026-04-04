import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { ThemeProvider } from "@/context/ThemeContext";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Парикмахерская Hair & Now",
  description: "Управление парикмахерской",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const menu = [
    { href: "/", label: "Главная" },
    { href: "/barbers", label: "Парикмахеры" },
    { href: "/clients", label: "Клиенты" },
    { href: "/services", label: "Услуги" },
    { href: "/appointments", label: "Запись" },
    { href: "/works", label: "Выполненные работы" },
    { href: "/reviews", label: "Отзывы" },
    { href: "/analytics", label: "Аналитика" },
  ];

  return (
    <html lang="ru">
      <body className={inter.className}>
        <ThemeProvider>
          <nav className="navbar">
            <div className="nav-container">
              <div className="nav-menu">
                {menu.map((item) => (
                  <Link key={item.href} href={item.href} className="nav-link">
                    {item.label}
                  </Link>
                ))}
                <ThemeToggle />
              </div>
            </div>
          </nav>
          <main className="main-content">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
