'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Package, MessageCircle, FileText, ArrowRight, ShoppingBag, Truck } from 'lucide-react';

function ConfettiDot({ style }) {
  return <div className="absolute w-2 h-2 rounded-full animate-bounce" style={style} />;
}

const DOTS = [
  { left: '10%', top: '20%', background: '#155e2c', animationDelay: '0s' },
  { left: '85%', top: '15%', background: '#f97316', animationDelay: '0.2s' },
  { left: '20%', top: '70%', background: '#3b82f6', animationDelay: '0.4s' },
  { left: '75%', top: '65%', background: '#f59e0b', animationDelay: '0.1s' },
  { left: '50%', top: '10%', background: '#10b981', animationDelay: '0.3s' },
  { left: '40%', top: '80%', background: '#8b5cf6', animationDelay: '0.5s' },
  { left: '90%', top: '40%', background: '#ef4444', animationDelay: '0.2s' },
  { left: '5%',  top: '50%', background: '#155e2c', animationDelay: '0.6s' },
];

const NEXT_STEPS = [
  {
    icon: FileText,
    title: 'Check your email',
    desc: 'Your order confirmation and invoice have been sent to your email address.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: MessageCircle,
    title: 'Connect with your supplier',
    desc: 'Message the supplier to share any additional requirements or documents.',
    color: 'bg-green-50 text-green-600',
    href: '/messages',
  },
  {
    icon: Truck,
    title: 'Track your shipment',
    desc: 'Once shipped, track your order in real-time from the Orders page.',
    color: 'bg-purple-50 text-purple-600',
    href: '/orders',
  },
];

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id') || 'ECL-DEMO';
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-green-50 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative dots */}
      <div className="absolute inset-0 pointer-events-none">
        {DOTS.map((style, i) => <ConfettiDot key={i} style={style} />)}
      </div>

      <div className={`max-w-2xl w-full transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Success card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-green-100 p-8 text-center mb-5 border border-green-50">
          {/* Checkmark */}
          <div className="relative w-20 h-20 mx-auto mb-5">
            <div className="w-20 h-20 rounded-full bg-primary-800 flex items-center justify-center shadow-lg shadow-primary-800/30">
              <CheckCircle2 size={40} className="text-white" />
            </div>
            {/* Pulse rings */}
            <div className="absolute inset-0 rounded-full bg-primary-800/20 animate-ping" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed! 🎉</h1>
          <p className="text-gray-500 mb-1">Thank you for your purchase on SL Beauty</p>
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-800 border border-primary-100 px-4 py-2 rounded-full text-sm font-bold mt-2">
            <Package size={15} />
            Order ID: {orderId}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
            <Link href={`/orders/${orderId}`}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-800 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-800/20">
              View Order <ArrowRight size={16} />
            </Link>
            <Link href="/products"
              className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
              <ShoppingBag size={16} /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* What's next */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">What happens next?</h2>
          <div className="space-y-4">
            {NEXT_STEPS.map((step, i) => {
              const Icon = step.icon;
              const content = (
                <div className="flex gap-4 items-start group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${step.color}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm group-hover:text-primary-800 transition-colors">{step.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                  </div>
                  {step.href && <ArrowRight size={16} className="text-gray-300 group-hover:text-primary-600 transition-colors mt-1 flex-shrink-0" />}
                </div>
              );
              return step.href ? (
                <Link key={i} href={step.href} className="block p-3 rounded-xl hover:bg-gray-50 transition-colors -mx-3">
                  {content}
                </Link>
              ) : (
                <div key={i} className="p-3 -mx-3">{content}</div>
              );
            })}
          </div>
        </div>

        {/* Support */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Need help? <Link href="/contact-support" className="text-primary-700 hover:underline">Contact support</Link> or
          {' '}<Link href="/messages" className="text-primary-700 hover:underline">message your supplier</Link> directly.
        </p>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary-800 border-t-transparent rounded-full animate-spin" /></div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
