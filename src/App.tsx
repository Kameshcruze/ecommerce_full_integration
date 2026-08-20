import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage";
import { Shirt } from "lucide-react";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans flex flex-col">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-neutral-900 hover:opacity-80 transition-opacity">
            <div className="bg-neutral-900 text-white p-1.5 rounded-lg">
              <Shirt className="w-5 h-5" />
            </div>
            Ecommerce Testing
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">Shop</Link>
            <Link to="/admin" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">Admin Panel</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {children}
      </main>
      <footer className="bg-white border-t border-neutral-200 py-8 text-center text-sm text-neutral-500">
        &copy; {new Date().getFullYear()} Ecommerce Testing. All rights reserved.
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
