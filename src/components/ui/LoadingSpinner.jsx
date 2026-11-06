export default function LoadingSpinner({ size = 'md', label = 'Loading…' }) {
  const dim = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-10 h-10' : 'w-7 h-7';
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-gray-400">
      <div className={`${dim} border-2 border-primary-200 border-t-primary-700 rounded-full animate-spin`} />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}
