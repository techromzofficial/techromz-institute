import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import NotificationCenter from '@/components/notifications/NotificationCenter';

export default function NotificationsPage() {
  return (
    <>
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">Track RFQ, quotation, order, and message updates.</p>
        </div>
        <NotificationCenter />
      </main>
      <Footer />
    </>
  );
}
