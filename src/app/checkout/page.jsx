'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BadgeCheck,
  Banknote,
  CreditCard,
  Headphones,
  Lock,
  PackageCheck,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { checkoutApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

const INITIAL_CUSTOMER = { fullName: '', email: '', phone: '' };
const INITIAL_ADDRESS = {
  address1: '',
  address2: '',
  city: '',
  province: '',
  postalCode: '',
  country: 'Sri Lanka',
  saveAddress: false,
};

const METHOD_ICONS = {
  card: CreditCard,
  bank_transfer: Banknote,
  cod: Truck,
};

function readCheckoutItem() {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(sessionStorage.getItem('slb_checkout_item'));
  } catch {
    return null;
  }
}

function checkoutPayloadFromItem(item) {
  const product = item?.product || {};
  return {
    product_id: Number.isInteger(product.id) ? product.id : undefined,
    product_slug: product.product_slug || product.backendSlug || product.slug,
    product_name: product.name,
    product_image: product.image,
    category_slug: product.categorySlug || product.category?.slug,
    category_name: product.categoryName || product.category?.label || product.category?.name,
    unit_price: product.price,
    unit: product.moqUnit || product.unit || 'Item',
    quantity: Number(item?.quantity) || 1,
  };
}

function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-gray-700">
        {label}
      </label>
      {children}
      {error && <p id={`${id}-error`} className="mt-1 text-xs font-medium text-primary-700">{error}</p>}
    </div>
  );
}

function CheckoutSection({ title, children }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}

function CheckoutProgress() {
  const steps = ['Details', 'Review', 'Confirmation'];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm">
      <div className="flex items-center">
        {steps.map((step, index) => (
          <div key={step} className="flex flex-1 items-center">
            <div className="flex items-center gap-2">
              <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                index === 0 ? 'bg-primary-800 text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {index + 1}
              </span>
              <span className={`hidden text-sm font-semibold sm:inline ${index === 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                {step}
              </span>
            </div>
            {index < steps.length - 1 && <div className="mx-3 h-0.5 flex-1 rounded-full bg-gray-200" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderSummary({
  quote,
  promoCode,
  setPromoCode,
  appliedPromo,
  onApplyPromo,
  onRemovePromo,
  applyingPromo,
  promoError,
}) {
  const product = quote.product;
  const totals = quote.totals;

  return (
    <aside className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:sticky lg:top-32">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Order Summary</h2>
      <div className="mb-4 flex gap-3">
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
          {product.image && <Image src={product.image} alt={product.name} fill unoptimized className="object-cover" />}
        </div>
        <div className="min-w-0">
          <p className="line-clamp-2 text-[15px] font-semibold text-gray-900">{product.name}</p>
          <p className="mt-1 text-xs text-gray-500">{product.brandName}</p>
          <p className="text-xs text-gray-400">{product.sellerName}</p>
        </div>
      </div>

      <div className="border-t border-gray-100 py-3">
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
          Promotion / Coupon
        </label>
        {appliedPromo ? (
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-800">
              <span className="font-bold uppercase tracking-wide">{appliedPromo.code || 'Promo Applied'}</span>
              <span>(-{formatCurrency(Number(totals.discount), quote.currency)})</span>
            </div>
            <button
              type="button"
              onClick={onRemovePromo}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <div>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                className="h-10 flex-1 rounded-xl border border-gray-200 px-3 text-xs uppercase outline-none focus:border-primary-700"
              />
              <button
                type="button"
                onClick={onApplyPromo}
                disabled={!promoCode || !promoCode.trim() || applyingPromo}
                className="h-10 rounded-xl bg-gray-900 px-3 text-xs font-semibold text-white transition hover:bg-gray-800 disabled:opacity-40"
              >
                {applyingPromo ? '...' : 'Apply'}
              </button>
            </div>
            {promoError && (
              <p className="mt-1 text-[11px] text-rose-600 font-medium">{promoError}</p>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2 border-t border-gray-100 pt-4 text-sm">
        <div className="flex justify-between text-gray-500"><span>Unit price</span><span>{formatCurrency(Number(quote.unit_price), quote.currency)}</span></div>
        <div className="flex justify-between text-gray-500"><span>Quantity</span><span>{quote.quantity}</span></div>
        <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatCurrency(Number(totals.subtotal), quote.currency)}</span></div>
        <div className="flex justify-between text-gray-500"><span>Delivery</span><span>{formatCurrency(Number(totals.shipping), quote.currency)}</span></div>
        {Number(totals.discount) > 0 && (
          <div className="flex justify-between font-medium text-emerald-700"><span>Discount</span><span>-{formatCurrency(Number(totals.discount), quote.currency)}</span></div>
        )}
        <div className="mt-3 flex justify-between border-t border-gray-100 pt-4 text-xl font-bold text-gray-900">
          <span>Total</span><span className="text-primary-800">{formatCurrency(Number(totals.total), quote.currency)}</span>
        </div>
      </div>
    </aside>
  );
}

function PaymentMethodCard({ method, selected, onSelect }) {
  const Icon = METHOD_ICONS[method.id] || CreditCard;
  const isAvailable = method.available !== false;

  return (
    <button
      type="button"
      onClick={isAvailable ? onSelect : undefined}
      disabled={!isAvailable}
      aria-pressed={selected}
      aria-disabled={!isAvailable}
      className={`w-full rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-primary-700 focus:ring-offset-2 ${
        !isAvailable
          ? 'border-gray-200 bg-gray-50/70 opacity-60 cursor-not-allowed'
          : selected
          ? 'border-primary-700 bg-primary-50 shadow-sm'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-full ${!isAvailable ? 'bg-gray-100 text-gray-400' : selected ? 'bg-primary-800 text-white' : 'bg-gray-100 text-gray-500'}`}>
          <Icon size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="block text-base font-semibold text-gray-900">{method.title}</span>
            {!isAvailable && (
              <span className="rounded bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                Unavailable
              </span>
            )}
          </span>
          <span className="mt-0.5 block text-xs text-gray-500">
            {!isAvailable && method.unavailable_reason ? method.unavailable_reason : method.description}
          </span>
          {method.requires_manual_review && isAvailable && (
            <span className="mt-3 inline-flex rounded border border-gray-200 bg-white px-2 py-1 text-[11px] font-bold text-gray-600">
              Pending verification
            </span>
          )}
        </span>
        <span className={`mt-1 h-4 w-4 rounded-full border ${!isAvailable ? 'border-gray-200 bg-gray-100' : selected ? 'border-primary-800 bg-primary-800 shadow-[inset_0_0_0_3px_white]' : 'border-gray-300'}`} />
      </div>
    </button>
  );
}

function CardNotice() {
  return (
    <div className="rounded-2xl border border-primary-100 bg-primary-50/60 p-4">
      <p className="flex items-center gap-2 text-xs font-semibold text-primary-800">
        <Lock size={14} /> Card details are processed only through the backend payment workflow.
      </p>
      <p className="mt-2 text-sm text-gray-600">
        Your order will show payment as processing until the payment provider confirms the result.
      </p>
    </div>
  );
}

function TradingProtection() {
  const benefits = [
    { icon: ShieldCheck, title: 'Payment Guarantee', text: 'Platform-protected payments with refund support for eligible order issues.' },
    { icon: Truck, title: 'Platform Logistics', text: 'Clearer shipment tracking with platform-supported logistics.' },
    { icon: PackageCheck, title: 'Inspection Service', text: 'Optional pre-shipment inspection for quality and quantity checks.' },
    { icon: Headphones, title: 'After-Sales & Dispute Handling', text: 'Platform-assisted dispute resolution, including refunds or returns when applicable.' },
  ];

  return (
    <CheckoutSection title="Online Trading Protection">
      <div className="divide-y divide-gray-100">
        {benefits.map((benefit) => {
          const Icon = benefit.icon;
          return (
            <div key={benefit.title} className="flex gap-3 py-4 first:pt-0 last:pb-0">
              <Icon size={22} className="mt-0.5 flex-shrink-0 text-gray-800" />
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{benefit.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </CheckoutSection>
  );
}

function validateCustomer(customer) {
  const errors = {};
  if (!customer.fullName.trim()) errors.fullName = 'Full name is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) errors.email = 'Enter a valid email address.';
  if (!/^[+()\d\s-]{7,}$/.test(customer.phone)) errors.phone = 'Enter a valid phone number.';
  return errors;
}

function validateAddress(address) {
  const errors = {};
  if (!address.address1.trim()) errors.address1 = 'Address line 1 is required.';
  if (!address.city.trim()) errors.city = 'City is required.';
  if (!address.province.trim()) errors.province = 'District or province is required.';
  if (!address.postalCode.trim()) errors.postalCode = 'Postal code is required.';
  if (!address.country.trim()) errors.country = 'Country is required.';
  return errors;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [quote, setQuote] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [customer, setCustomer] = useState(INITIAL_CUSTOMER);
  const [address, setAddress] = useState(INITIAL_ADDRESS);
  const [payment, setPayment] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loadingQuote, setLoadingQuote] = useState(true);
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState('');

  useEffect(() => {
    const selectedItem = readCheckoutItem();
    setItem(selectedItem);

    if (!selectedItem?.product) {
      setLoadingQuote(false);
      return;
    }

    checkoutApi.quote(checkoutPayloadFromItem(selectedItem))
      .then((response) => {
        setQuote(response.quote);
        if (response.quote.promotion?.applied) {
          setAppliedPromo(response.quote.promotion);
          setPromoCode(response.quote.promotion.code || '');
        }
        const methods = response.payment_methods || [];
        setPaymentMethods(methods);
        const firstAvailable = methods.find((m) => m.available !== false);
        setPayment(firstAvailable?.id || methods[0]?.id || 'cod');
      })
      .catch((error) => {
        toast.error(error.message || 'Could not prepare checkout.');
      })
      .finally(() => setLoadingQuote(false));
  }, []);

  const handleApplyPromo = async () => {
    if (!promoCode.trim() || !item) return;
    setApplyingPromo(true);
    setPromoError('');
    try {
      const payload = {
        ...checkoutPayloadFromItem(item),
        promotion_code: promoCode.trim(),
      };
      const response = await checkoutApi.quote(payload);
      if (response.quote.promotion?.applied) {
        setQuote(response.quote);
        setAppliedPromo(response.quote.promotion);
        toast.success(`Coupon "${response.quote.promotion.code}" applied!`);
      } else {
        setPromoError(response.quote.promotion?.message || 'Promotion is not applicable.');
        toast.error(response.quote.promotion?.message || 'Promotion is not applicable.');
      }
    } catch (err) {
      const msg = err.message || 'Failed to apply coupon.';
      setPromoError(msg);
      toast.error(msg);
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleRemovePromo = async () => {
    if (!item) return;
    setApplyingPromo(true);
    setPromoError('');
    try {
      const payload = checkoutPayloadFromItem(item);
      const response = await checkoutApi.quote(payload);
      setQuote(response.quote);
      setAppliedPromo(null);
      setPromoCode('');
      toast.info('Coupon removed.');
    } catch (err) {
      toast.error(err.message || 'Failed to recalculate quote.');
    } finally {
      setApplyingPromo(false);
    }
  };

  const customerErrors = useMemo(() => validateCustomer(customer), [customer]);
  const addressErrors = useMemo(() => validateAddress(address), [address]);
  const selectedMethod = paymentMethods.find((m) => m.id === payment);
  const isPaymentAvailable = selectedMethod ? selectedMethod.available !== false : true;
  const isValid = quote && payment && isPaymentAvailable && agreed && !Object.keys(customerErrors).length && !Object.keys(addressErrors).length;
  const inputClass = 'h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none transition focus:border-primary-700 focus:ring-2 focus:ring-primary-700/15';

  const updateCustomer = (field) => (event) => setCustomer((current) => ({ ...current, [field]: event.target.value }));
  const updateAddress = (field) => (event) => setAddress((current) => ({ ...current, [field]: event.target.value }));

  const continueToReview = () => {
    setTouched(true);
    if (!isPaymentAvailable) {
      toast.error('The selected payment method is currently unavailable. Please choose another payment method.');
      return;
    }
    if (!isValid) return;

    setSaving(true);
    sessionStorage.setItem('slb_checkout_review', JSON.stringify({
      item,
      lookup: checkoutPayloadFromItem(item),
      quote,
      customer,
      delivery: address,
      payment_method: payment,
      promotion_code: appliedPromo?.code || quote.promotion?.code || null,
      idempotency_key: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    }));
    router.push('/checkout/payment-confirmation');
  };

  if (loadingQuote) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-screen-xl px-4 py-10">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="h-96 animate-pulse rounded-2xl bg-gray-100" />
            <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!item?.product || !quote) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-16 text-center">
          <PackageCheck size={46} className="mx-auto mb-4 text-gray-300" />
          <h1 className="text-2xl font-semibold text-gray-900">No checkout item selected</h1>
          <p className="mt-2 text-sm text-gray-500">Choose an available product and use Buy Now to start secure checkout.</p>
          <Link href="/products" className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary-800 px-5 text-sm font-bold text-white hover:bg-primary-900">
            Browse Products
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-screen-xl px-4 py-6 sm:py-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.04em] text-primary-700">SL Beauty Platform</p>
          <h1 className="mt-1 text-3xl font-bold text-gray-950 sm:text-4xl">Secure Checkout</h1>
        </div>
        <CheckoutProgress />

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-5 lg:order-1">
            <CheckoutSection title="Customer Information">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="fullName" label="Full Name" error={touched && customerErrors.fullName}>
                  <input id="fullName" value={customer.fullName} onChange={updateCustomer('fullName')} className={inputClass} />
                </Field>
                <Field id="email" label="Email Address" error={touched && customerErrors.email}>
                  <input id="email" type="email" value={customer.email} onChange={updateCustomer('email')} className={inputClass} />
                </Field>
                <Field id="phone" label="Phone Number" error={touched && customerErrors.phone}>
                  <input id="phone" type="tel" value={customer.phone} onChange={updateCustomer('phone')} className={inputClass} />
                </Field>
              </div>
            </CheckoutSection>

            <CheckoutSection title="Delivery Address">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field id="address1" label="Address Line 1" error={touched && addressErrors.address1}>
                    <input id="address1" value={address.address1} onChange={updateAddress('address1')} className={inputClass} />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field id="address2" label="Address Line 2">
                    <input id="address2" value={address.address2} onChange={updateAddress('address2')} className={inputClass} />
                  </Field>
                </div>
                <Field id="city" label="City" error={touched && addressErrors.city}>
                  <input id="city" value={address.city} onChange={updateAddress('city')} className={inputClass} />
                </Field>
                <Field id="province" label="District / Province" error={touched && addressErrors.province}>
                  <select id="province" value={address.province} onChange={updateAddress('province')} className={inputClass}>
                    <option value="">Select district or province</option>
                    <option>Colombo</option>
                    <option>Gampaha</option>
                    <option>Kandy</option>
                    <option>Galle</option>
                    <option>Jaffna</option>
                    <option>Western Province</option>
                    <option>Central Province</option>
                    <option>Southern Province</option>
                  </select>
                </Field>
                <Field id="postalCode" label="Postal Code" error={touched && addressErrors.postalCode}>
                  <input id="postalCode" value={address.postalCode} onChange={updateAddress('postalCode')} className={inputClass} />
                </Field>
                <Field id="country" label="Country" error={touched && addressErrors.country}>
                  <select id="country" value={address.country} onChange={updateAddress('country')} className={inputClass}>
                    <option>Sri Lanka</option>
                    <option>India</option>
                    <option>United Arab Emirates</option>
                    <option>Singapore</option>
                  </select>
                </Field>
              </div>
              <label className="mt-4 flex items-center gap-2 text-sm font-medium text-gray-600">
                <input type="checkbox" checked={address.saveAddress} onChange={(event) => setAddress((current) => ({ ...current, saveAddress: event.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-primary-800 focus:ring-primary-700" />
                Save this address for future orders
              </label>
            </CheckoutSection>

            <CheckoutSection title="Choose Payment Method">
              <div className="grid gap-3">
                {paymentMethods.map((method) => (
                  <PaymentMethodCard key={method.id} method={method} selected={payment === method.id} onSelect={() => setPayment(method.id)} />
                ))}
              </div>
              {payment === 'card' && <div className="mt-4"><CardNotice /></div>}
              {payment === 'bank_transfer' && (
                <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                  <p className="font-bold text-gray-900">Bank Transfer Instructions</p>
                  <p className="mt-2">Order remains pending until payment verification.</p>
                  <p className="mt-1">Bank information will be shown after order confirmation.</p>
                </div>
              )}
            </CheckoutSection>

            <TradingProtection />

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <label className="flex items-start gap-3 text-sm text-gray-600">
                <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-800 focus:ring-primary-700" />
                <span>I agree to the Terms & Conditions and Privacy Policy.</span>
              </label>
              <button
                type="button"
                onClick={continueToReview}
                disabled={!isValid || saving}
                className="mt-4 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-primary-800 px-5 text-[15px] font-semibold text-white transition hover:bg-primary-900 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? <span className="h-5 w-5 rounded-full border-2 border-white/40 border-t-white animate-spin" /> : <BadgeCheck size={18} />}
                {saving ? 'Preparing Review...' : 'Continue to Review'}
              </button>
            </section>
          </div>

          <div className="lg:order-2">
            <OrderSummary
              quote={quote}
              promoCode={promoCode}
              setPromoCode={setPromoCode}
              appliedPromo={appliedPromo}
              onApplyPromo={handleApplyPromo}
              onRemovePromo={handleRemovePromo}
              applyingPromo={applyingPromo}
              promoError={promoError}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
