'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  BadgeCheck,
  Building2,
  ExternalLink,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  Video,
  Wrench,
} from 'lucide-react';
import toast from 'react-hot-toast';
import FileUploadField from '@/components/ui/FileUploadField';
import { supplierProfileApi } from '@/lib/api';

const emptyCompanyForm = {
  company_name: '',
  description: '',
  address: '',
  city: '',
  country: '',
  website: '',
  established_year: '',
  phone: '',
  email: '',
  business_type: '',
  employee_count: '',
  factory_size: '',
  annual_revenue: '',
  export_percentage: '',
  main_markets: '',
};

const emptyCapacityForm = {
  monthly_output: '',
  output_unit: '',
  production_lines: '',
  lead_time: '',
  factory_size: '',
};

const emptyCertificateForm = {
  certificate_name: '',
  certificate_number: '',
  issuing_authority: '',
  issue_date: '',
  expiry_date: '',
  file_url: '',
};

const emptyVideoForm = {
  title: '',
  video_url: '',
};

function firstError(errors, field) {
  const value = errors?.[field];
  return Array.isArray(value) ? value[0] : value;
}

function arrayFrom(response, key) {
  return Array.isArray(response?.[key]) ? response[key] : [];
}

function normalizeCompanyForm(supplier = {}) {
  return {
    company_name: supplier.company_name || '',
    description: supplier.description || '',
    address: supplier.address || '',
    city: supplier.city || '',
    country: supplier.country || '',
    website: supplier.website || '',
    established_year: supplier.established_year || '',
    phone: supplier.phone || '',
    email: supplier.email || '',
    business_type: supplier.business_type || '',
    employee_count: supplier.employee_count || '',
    factory_size: supplier.factory_size || '',
    annual_revenue: supplier.annual_revenue || '',
    export_percentage: supplier.export_percentage || '',
    main_markets: Array.isArray(supplier.main_markets)
      ? supplier.main_markets.join(', ')
      : '',
  };
}

function normalizeCapacityForm(capacity = {}) {
  return {
    monthly_output: capacity?.monthly_output || '',
    output_unit: capacity?.output_unit || '',
    production_lines: capacity?.production_lines ?? '',
    lead_time: capacity?.lead_time || '',
    factory_size: capacity?.factory_size || '',
  };
}

function asNullableNumber(value) {
  return value === '' || value === null || value === undefined ? null : Number(value);
}

function companyPayload(form) {
  return {
    ...form,
    established_year: asNullableNumber(form.established_year),
    employee_count: asNullableNumber(form.employee_count),
    annual_revenue: asNullableNumber(form.annual_revenue),
    export_percentage: asNullableNumber(form.export_percentage),
    main_markets: form.main_markets
      ? form.main_markets.split(',').map((market) => market.trim()).filter(Boolean)
      : [],
  };
}

function capacityPayload(form) {
  return {
    ...form,
    production_lines: asNullableNumber(form.production_lines),
  };
}

function Section({ icon: Icon, title, children }) {
  return (
    <section className="border border-gray-100 rounded-2xl p-5 bg-white">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={18} className="text-primary-700" />
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function FieldError({ errors, field }) {
  const message = firstError(errors, field);
  if (!message) return null;

  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

export default function SupplierProfileManager() {
  const [companyForm, setCompanyForm] = useState(emptyCompanyForm);
  const [capacityForm, setCapacityForm] = useState(emptyCapacityForm);
  const [certificateForm, setCertificateForm] = useState(emptyCertificateForm);
  const [videoForm, setVideoForm] = useState(emptyVideoForm);
  const [strengthName, setStrengthName] = useState('');
  const [editingStrength, setEditingStrength] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [videos, setVideos] = useState([]);
  const [strengths, setStrengths] = useState([]);
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');
  const [validation, setValidation] = useState({});
  const [reloadKey, setReloadKey] = useState(0);

  const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await supplierProfileApi.getCompanyProfile();
        if (cancelled) return;

        setSupplier(response.supplier || null);
        setCompanyForm(normalizeCompanyForm(response.supplier));
        setCapacityForm(normalizeCapacityForm(response.production_capacity));
        setCertificates(arrayFrom(response, 'certificates'));
        setVideos(arrayFrom(response, 'videos'));
        setStrengths(arrayFrom(response, 'strengths'));
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || 'Could not load supplier profile.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const profileUrl = useMemo(
    () => (supplier?.id ? `/suppliers/${supplier.id}` : null),
    [supplier?.id],
  );

  const reload = () => setReloadKey((value) => value + 1);

  const saveCompany = async (event) => {
    event.preventDefault();
    setSaving('company');
    setValidation({});

    try {
      const response = await supplierProfileApi.updateCompanyProfile(companyPayload(companyForm));
      setSupplier(response.supplier || null);
      setCompanyForm(normalizeCompanyForm(response.supplier));
      toast.success(response.message || 'Company profile updated.');
    } catch (saveError) {
      setValidation(saveError.errors || {});
      toast.error(saveError.message || 'Could not update company profile.');
    } finally {
      setSaving('');
    }
  };

  const saveCapacity = async (event) => {
    event.preventDefault();
    setSaving('capacity');
    setValidation({});

    try {
      const response = await supplierProfileApi.updateProductionCapacity(capacityPayload(capacityForm));
      setCapacityForm(normalizeCapacityForm(response.production_capacity));
      toast.success(response.message || 'Production capacity updated.');
    } catch (saveError) {
      setValidation(saveError.errors || {});
      toast.error(saveError.message || 'Could not update production capacity.');
    } finally {
      setSaving('');
    }
  };

  const addCertificate = async (event) => {
    event.preventDefault();
    setSaving('certificate');
    setValidation({});

    try {
      const response = await supplierProfileApi.createCertificate(certificateForm);
      setCertificates((items) => [response.certificate, ...items].filter(Boolean));
      setCertificateForm(emptyCertificateForm);
      toast.success(response.message || 'Certificate added.');
    } catch (saveError) {
      setValidation(saveError.errors || {});
      toast.error(saveError.message || 'Could not add certificate.');
    } finally {
      setSaving('');
    }
  };

  const addVideo = async (event) => {
    event.preventDefault();
    setSaving('video');
    setValidation({});

    try {
      const response = await supplierProfileApi.createVideo(videoForm);
      setVideos((items) => [response.video, ...items].filter(Boolean));
      setVideoForm(emptyVideoForm);
      toast.success(response.message || 'Video added.');
    } catch (saveError) {
      setValidation(saveError.errors || {});
      toast.error(saveError.message || 'Could not add video.');
    } finally {
      setSaving('');
    }
  };

  const saveStrength = async (event) => {
    event.preventDefault();
    setSaving('strength');
    setValidation({});

    try {
      const payload = { strength_name: strengthName };
      const response = editingStrength
        ? await supplierProfileApi.updateStrength(editingStrength.id, payload)
        : await supplierProfileApi.createStrength(payload);

      if (editingStrength) {
        setStrengths((items) => items.map((item) => (
          item.id === editingStrength.id ? response.strength : item
        )));
      } else {
        setStrengths((items) => [...items, response.strength].filter(Boolean));
      }

      setStrengthName('');
      setEditingStrength(null);
      toast.success(response.message || 'Strength saved.');
    } catch (saveError) {
      setValidation(saveError.errors || {});
      toast.error(saveError.message || 'Could not save strength.');
    } finally {
      setSaving('');
    }
  };

  const deleteItem = async (type, id) => {
    if (!window.confirm('Delete this item?')) return;

    setSaving(`${type}-${id}`);
    try {
      if (type === 'certificate') {
        await supplierProfileApi.deleteCertificate(id);
        setCertificates((items) => items.filter((item) => item.id !== id));
      }
      if (type === 'video') {
        await supplierProfileApi.deleteVideo(id);
        setVideos((items) => items.filter((item) => item.id !== id));
      }
      if (type === 'strength') {
        await supplierProfileApi.deleteStrength(id);
        setStrengths((items) => items.filter((item) => item.id !== id));
        if (editingStrength?.id === id) {
          setEditingStrength(null);
          setStrengthName('');
        }
      }
      toast.success('Item deleted.');
    } catch (deleteError) {
      toast.error(deleteError.message || 'Could not delete item.');
    } finally {
      setSaving('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 py-10">
        <Loader2 size={18} className="animate-spin text-primary-700" />
        Loading supplier profile…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start justify-between gap-4">
        <div className="flex items-start gap-2">
          <AlertCircle size={17} className="text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-700">Supplier profile unavailable</p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
        </div>
        <button type="button" onClick={reload} className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 hover:underline">
          <RefreshCw size={13} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-gray-800">Supplier Company Profile</h2>
          <p className="text-sm text-gray-500 mt-1">Manage the public company information buyers see.</p>
        </div>
        {profileUrl && (
          <Link href={profileUrl} className="text-sm text-primary-700 hover:underline inline-flex items-center gap-1">
            View storefront <ExternalLink size={13} />
          </Link>
        )}
      </div>

      <Section icon={Building2} title="Company Information">
        <form onSubmit={saveCompany} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            ['company_name', 'Company Name', true],
            ['country', 'Country', true],
            ['city', 'City'],
            ['address', 'Address'],
            ['website', 'Website'],
            ['established_year', 'Established Year', false, 'number'],
            ['phone', 'Phone'],
            ['email', 'Email', false, 'email'],
            ['business_type', 'Business Type'],
            ['employee_count', 'Employee Count', false, 'number'],
            ['factory_size', 'Factory Size'],
            ['annual_revenue', 'Annual Revenue', false, 'number'],
            ['export_percentage', 'Export Percentage', false, 'number'],
            ['main_markets', 'Main Markets', false, 'text', 'Comma-separated markets'],
          ].map(([field, label, required = false, type = 'text', placeholder = '']) => (
            <div key={field}>
              <label className={labelClass}>{label}</label>
              <input
                type={type}
                required={required}
                className={inputClass}
                value={companyForm[field]}
                placeholder={placeholder}
                onChange={(event) => setCompanyForm((current) => ({
                  ...current,
                  [field]: event.target.value,
                }))}
              />
              <FieldError errors={validation} field={field} />
            </div>
          ))}
          <div className="md:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea
              rows={4}
              className={inputClass}
              value={companyForm.description}
              onChange={(event) => setCompanyForm((current) => ({
                ...current,
                description: event.target.value,
              }))}
            />
            <FieldError errors={validation} field="description" />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={saving === 'company'}
              className="px-5 py-2.5 bg-primary-800 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl disabled:opacity-60"
            >
              {saving === 'company' ? 'Saving…' : 'Save Company Profile'}
            </button>
          </div>
        </form>
      </Section>

      <Section icon={FileText} title="Certificates">
        <form onSubmit={addCertificate} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {[
            ['certificate_name', 'Certificate Name', true],
            ['certificate_number', 'Certificate Number'],
            ['issuing_authority', 'Issuing Organization'],
            ['issue_date', 'Issue Date', false, 'date'],
            ['expiry_date', 'Expiry Date', false, 'date'],
            ['file_url', 'File URL'],
          ].map(([field, label, required = false, type = 'text']) => (
            <div key={field}>
              <label className={labelClass}>{label}</label>
              <input
                type={type}
                required={required}
                className={inputClass}
                value={certificateForm[field]}
                onChange={(event) => setCertificateForm((current) => ({
                  ...current,
                  [field]: event.target.value,
                }))}
              />
              <FieldError errors={validation} field={field} />
            </div>
          ))}
          <div className="md:col-span-2 space-y-3">
            <FileUploadField
              kind="document"
              category="supplier_certificate"
              label="Upload certificate document"
              value={certificateForm.file_url}
              disabled={saving === 'certificate'}
              onUploaded={(url) => setCertificateForm((current) => ({ ...current, file_url: url }))}
            />
            <button
              type="submit"
              disabled={saving === 'certificate'}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-800 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60"
            >
              <Plus size={14} /> {saving === 'certificate' ? 'Adding…' : 'Add Certificate'}
            </button>
          </div>
        </form>
        {certificates.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">No certificates added yet.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {certificates.map((certificate) => (
              <div key={certificate.id} className="py-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{certificate.certificate_name}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {[certificate.issuing_authority, certificate.issue_date].filter(Boolean).join(' · ') || 'Certificate details not provided'}
                  </p>
                  {certificate.file_url && (
                    <a href={certificate.file_url} target="_blank" rel="noreferrer" className="text-xs text-primary-700 hover:underline inline-flex items-center gap-1 mt-1">
                      Open document <ExternalLink size={11} />
                    </a>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => deleteItem('certificate', certificate.id)}
                  disabled={saving === `certificate-${certificate.id}`}
                  className="text-red-500 hover:text-red-600 disabled:opacity-60"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Section icon={Video} title="Company Videos">
          <form onSubmit={addVideo} className="space-y-3 mb-5">
            <div>
              <label className={labelClass}>Video Title</label>
              <input
                required
                className={inputClass}
                value={videoForm.title}
                onChange={(event) => setVideoForm((current) => ({ ...current, title: event.target.value }))}
              />
              <FieldError errors={validation} field="title" />
            </div>
            <div>
              <label className={labelClass}>External Video URL</label>
              <input
                required
                type="url"
                className={inputClass}
                value={videoForm.video_url}
                onChange={(event) => setVideoForm((current) => ({ ...current, video_url: event.target.value }))}
              />
              <FieldError errors={validation} field="video_url" />
            </div>
            <button
              type="submit"
              disabled={saving === 'video'}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-800 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60"
            >
              <Plus size={14} /> {saving === 'video' ? 'Adding…' : 'Add Video'}
            </button>
          </form>
          {videos.length === 0 ? (
            <p className="text-sm text-gray-400 py-4">No company videos added yet.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {videos.map((video) => (
                <div key={video.id} className="py-3 flex items-start justify-between gap-3">
                  <a href={video.video_url} target="_blank" rel="noreferrer" className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 hover:text-primary-700 truncate">{video.title}</p>
                    <p className="text-xs text-gray-400 mt-1 truncate">{video.video_url}</p>
                  </a>
                  <button type="button" onClick={() => deleteItem('video', video.id)} className="text-red-500 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section icon={BadgeCheck} title="Company Strengths">
          <form onSubmit={saveStrength} className="flex flex-col sm:flex-row gap-2 mb-5">
            <div className="flex-1">
              <input
                required
                className={inputClass}
                placeholder="e.g. ISO certified factory"
                value={strengthName}
                onChange={(event) => setStrengthName(event.target.value)}
              />
              <FieldError errors={validation} field="strength_name" />
            </div>
            <button
              type="submit"
              disabled={saving === 'strength'}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-800 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60"
            >
              <Plus size={14} /> {editingStrength ? 'Update' : 'Add'}
            </button>
            {editingStrength && (
              <button
                type="button"
                onClick={() => {
                  setEditingStrength(null);
                  setStrengthName('');
                }}
                className="px-4 py-2 border border-gray-200 text-sm rounded-lg"
              >
                Cancel
              </button>
            )}
          </form>
          {strengths.length === 0 ? (
            <p className="text-sm text-gray-400 py-4">No company strengths added yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {strengths.map((strength) => (
                <div key={strength.id} className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-primary-50 text-primary-800 text-sm">
                  <span>{strength.strength_name}</span>
                  <button
                    type="button"
                    className="text-primary-700 hover:underline text-xs"
                    onClick={() => {
                      setEditingStrength(strength);
                      setStrengthName(strength.strength_name || '');
                    }}
                  >
                    Edit
                  </button>
                  <button type="button" onClick={() => deleteItem('strength', strength.id)} className="text-red-500">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      <Section icon={Wrench} title="Production Capacity">
        <form onSubmit={saveCapacity} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            ['monthly_output', 'Monthly Output'],
            ['output_unit', 'Output Unit'],
            ['production_lines', 'Production Lines', false, 'number'],
            ['lead_time', 'Lead Time'],
            ['factory_size', 'Factory Size'],
          ].map(([field, label, required = false, type = 'text']) => (
            <div key={field}>
              <label className={labelClass}>{label}</label>
              <input
                type={type}
                required={required}
                className={inputClass}
                value={capacityForm[field]}
                onChange={(event) => setCapacityForm((current) => ({
                  ...current,
                  [field]: event.target.value,
                }))}
              />
              <FieldError errors={validation} field={field} />
            </div>
          ))}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={saving === 'capacity'}
              className="px-5 py-2.5 bg-primary-800 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl disabled:opacity-60"
            >
              {saving === 'capacity' ? 'Saving…' : 'Save Production Capacity'}
            </button>
          </div>
        </form>
      </Section>
    </div>
  );
}
