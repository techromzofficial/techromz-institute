import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SupplierSidebar from '@/components/supplier/SupplierSidebar';

export const metadata = {
  title: 'Supplier Dashboard | SL Beauty',
};

export default function SupplierDashboardLayout({ children }) {
  return (
    <>
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="flex gap-6 items-start">
          <SupplierSidebar />
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}
