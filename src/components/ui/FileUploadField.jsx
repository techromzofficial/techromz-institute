'use client';

import Image from 'next/image';
import { useState } from 'react';
import { AlertCircle, FileText, Loader2, RefreshCw, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadApi } from '@/lib/api';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

function typeLabel(kind) {
  return kind === 'image' ? 'JPG, PNG, or WebP' : 'PDF, DOC, DOCX, or XLSX';
}

export default function FileUploadField({
  kind = 'image',
  category,
  value,
  label = 'Upload file',
  disabled = false,
  onUploaded,
}) {
  const [uploading, setUploading] = useState(false);
  const [lastFile, setLastFile] = useState(null);
  const [error, setError] = useState('');

  const maxSizeMb = kind === 'image' ? 5 : 20;
  const allowedTypes = kind === 'image' ? IMAGE_TYPES : DOCUMENT_TYPES;
  const accept = kind === 'image'
    ? 'image/jpeg,image/png,image/webp'
    : '.pdf,.doc,.docx,.xlsx';

  const uploadFile = async (file) => {
    if (!file) return;

    if (!allowedTypes.includes(file.type)) {
      const message = `Use ${typeLabel(kind)}.`;
      setError(message);
      toast.error(message);
      return;
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
      const message = `File must be ${maxSizeMb}MB or smaller.`;
      setError(message);
      toast.error(message);
      return;
    }

    setLastFile(file);
    setUploading(true);
    setError('');

    try {
      const response = kind === 'image'
        ? await uploadApi.uploadImage(file, category)
        : await uploadApi.uploadDocument(file, category);
      const url = response.url || response.file_url || response.path || '';
      onUploaded?.(url, response);
      toast.success('Upload complete.');
    } catch (uploadError) {
      const message = uploadError.message || 'Upload failed. Please retry.';
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    uploadFile(file);
  };

  const canRetry = Boolean(lastFile) && !uploading && error;

  return (
    <div className="space-y-2">
      {value && kind === 'image' && (
        <div className="w-24 h-24 rounded-xl border border-gray-100 overflow-hidden bg-gray-50">
          <Image
            src={value}
            alt="Uploaded preview"
            width={96}
            height={96}
            unoptimized
            className="w-full h-full object-cover"
          />
        </div>
      )}
      {value && kind === 'document' && (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-xs text-primary-700 hover:underline"
        >
          <FileText size={14} /> View uploaded document
        </a>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <label className={`inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 ${disabled || uploading ? 'opacity-60 pointer-events-none' : 'cursor-pointer'}`}>
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {uploading ? 'Uploading…' : label}
          <input
            type="file"
            accept={accept}
            className="hidden"
            disabled={disabled || uploading}
            onChange={handleChange}
          />
        </label>
        {canRetry && (
          <button
            type="button"
            onClick={() => uploadFile(lastFile)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 hover:underline"
          >
            <RefreshCw size={13} /> Retry
          </button>
        )}
        <span className="text-[11px] text-gray-400">
          {typeLabel(kind)} · max {maxSizeMb}MB
        </span>
      </div>
      {error && (
        <p className="inline-flex items-center gap-1 text-xs text-red-600">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}
