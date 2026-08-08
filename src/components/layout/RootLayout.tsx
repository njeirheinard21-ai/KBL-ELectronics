import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ScrollRestoration } from "react-router-dom";
import { SlideOverCart } from "../cart/SlideOverCart";
import { AuthModal } from "../auth/AuthModal";

export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-canvas focus:text-brand">Skip to content</a>
      <ScrollRestoration />
      <Navbar />
      <SlideOverCart />
      <AuthModal />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
