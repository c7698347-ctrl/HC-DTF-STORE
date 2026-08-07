import './globals.css';
import { StoreProvider } from '@/context/StoreContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/checkout/CartDrawer';
import AuthModal from '@/components/auth/AuthModal';
import ProductDetailModal from '@/components/product/ProductDetailModal';
import HisuhiAiWidget from '@/components/layout/HisuhiAiWidget';

export const metadata = {
  title: 'HC DTF STORE - Premium Direct-To-Film Transfer Sheets & Patches',
  description: 'Official factory ecommerce store for HC DTF STORE. Order 1 Meter 22x39 & 12x39 DTF sheets, maggam blouse prints, gold zari saree borders & kids patches.',
  keywords: 'HC DTF STORE, DTF Sheets, 22x39 DTF sheet, 12x39 DTF sheet, Maggam blouse DTF, Saree border DTF, DTF Patches, Direct To Film Hyderabad India',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col justify-between bg-[#FAFBFB] text-slate-900 font-sans antialiased">
        <StoreProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          
          {/* Global Interactivity Modals & HISUHI AI Assistant */}
          <CartDrawer />
          <AuthModal />
          <ProductDetailModal />
          <HisuhiAiWidget />
        </StoreProvider>
      </body>
    </html>
  );
}
