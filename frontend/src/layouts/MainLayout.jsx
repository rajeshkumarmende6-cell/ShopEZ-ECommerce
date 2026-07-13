import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 dark:bg-slate-950 transition duration-300 font-sans">
      {/* Sticky Header */}
      <Navbar />

      {/* Main Page Area */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default MainLayout;
