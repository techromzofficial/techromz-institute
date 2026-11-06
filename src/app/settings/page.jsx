import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SettingsContent from './SettingsContent';

export const metadata = { title: 'Account Settings' };

export default function SettingsPage() {
  return (
    <>
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-800 mb-1">Account Settings</h1>
        <p className="text-sm text-gray-400 mb-6">Manage your supported profile details and account security</p>
        <SettingsContent />
      </main>
      <Footer />
    </>
  );
}
