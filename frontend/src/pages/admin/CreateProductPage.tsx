import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Plus,
  Trash2,
  Image as ImageIcon,
  Check,
  Loader2,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  Globe,
  Monitor,
} from 'lucide-react';
import type { CreateProductDto } from 'shared';
import SellerLayout from '../../components/seller/SellerLayout';
import { Select } from '../../components/ui/select';
import api from '../../lib/api';

const compressImage = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas to Blob failed'));
            }
          },
          'image/jpeg',
          0.85 // 85% quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function CreateProductPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: metadata } = useQuery({
    queryKey: ['admin-metadata'],
    queryFn: async () => {
      const res = await api.get('/admin/metadata');
      return res.data;
    },
  });

  // Product fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [developer, setDeveloper] = useState('');
  const [publisher, setPublisher] = useState('');
  const [systemRequirements, setSystemRequirements] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [rating, setRating] = useState('9.2 / 10');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // Variant fields
  const [variantName, setVariantName] = useState('Standard Edition');
  const [price, setPrice] = useState('49.99');
  const [storeId, setStoreId] = useState('');
  const [typeId, setTypeId] = useState('');
  const [region, setRegion] = useState('');
  const [activationGuide, setActivationGuide] = useState('');
  const [stagedKeys, setStagedKeys] = useState<string[]>([]);
  const [currentKey, setCurrentKey] = useState('');

  // Auto-select first metadata options
  useEffect(() => {
    if (metadata?.stores?.[0] && !storeId) {
      setStoreId(String(metadata.stores[0].id));
    }
    if (metadata?.types?.[0] && !typeId) {
      setTypeId(String(metadata.types[0].id));
    }
    if (metadata?.regions?.[0] && !region) {
      setRegion(String(metadata.regions[0].id));
    }
  }, [metadata, storeId, typeId, region]);

  // Clean up preview object URL on unmount or change
  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreviewUrl(objectUrl);
    setImageError(null);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [imageFile]);

  // Normalized select options
  const storeOptions: Array<{ value: string; label: string }> = useMemo(() => {
    return (
      metadata?.stores?.map((s: { id: number | string; name: string }) => ({
        value: String(s.id),
        label: s.name,
      })) || [
        { value: '1', label: 'Steam' },
        { value: '2', label: 'Epic Games' },
        { value: '3', label: 'PlayStation' },
      ]
    );
  }, [metadata]);

  const typeOptions: Array<{ value: string; label: string }> = useMemo(() => {
    return (
      metadata?.types?.map((t: { id: number | string; name: string }) => ({
        value: String(t.id),
        label: t.name,
      })) || [
        { value: '1', label: 'Game Key' },
        { value: '2', label: 'Top-Up' },
        { value: '3', label: 'Subscription' },
      ]
    );
  }, [metadata]);

  const regionOptions: Array<{ value: string; label: string }> = useMemo(() => {
    return (
      metadata?.regions?.map((r: { id: number | string; name: string }) => ({
        value: String(r.id),
        label: r.name,
      })) || [
        { value: '1', label: 'Global' },
        { value: '2', label: 'Asia' },
        { value: '3', label: 'North America' },
        { value: '4', label: 'Europe' },
      ]
    );
  }, [metadata]);

  const statusOptions = [
    { value: 'ACTIVE', label: 'Active Listing' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'INACTIVE', label: 'Inactive' },
  ];

  const selectedStoreName = storeOptions.find((s) => s.value === storeId)?.label || 'Steam';
  const selectedRegionName = regionOptions.find((r) => r.value === region)?.label || 'Global';

  const handleAddKey = () => {
    const trimmed = currentKey.trim().toUpperCase();
    if (trimmed && !stagedKeys.includes(trimmed)) {
      setStagedKeys([...stagedKeys, trimmed]);
      setCurrentKey('');
    }
  };

  const handleRemoveKey = (keyToRemove: string) => {
    setStagedKeys(stagedKeys.filter((k) => k !== keyToRemove));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setImageError('Please select a valid image file (PNG, JPG, WEBP).');
        return;
      }
      setImageFile(file);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (dto: CreateProductDto) => {
      const formData = new FormData();
      formData.append('data', JSON.stringify(dto));

      if (imageFile) {
        const compressedBlob = await compressImage(imageFile);
        formData.append('file', compressedBlob, imageFile.name);
      } else {
        throw new Error('Please select a product image.');
      }

      await api.post('/admin/products', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      navigate('/admin/products');
    },
    onError: (err: any) => {
      setImageError(err.response?.data?.message || err.message || 'Failed to publish product.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) {
      setImageError('Please choose a product cover image before publishing.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    createMutation.mutate({
      title,
      description,
      developer,
      publisher,
      systemRequirements,
      tags,
      status,
      rating,
      variants: [
        {
          name: variantName,
          price: Math.round(parseFloat(price || '0') * 100), // convert to cents
          storeId: storeId ? parseInt(storeId, 10) : metadata?.stores?.[0]?.id,
          typeId: typeId ? parseInt(typeId, 10) : metadata?.types?.[0]?.id,
          region: region ? parseInt(region, 10) : metadata?.regions?.[0]?.id,
          languageSupport: ['English'],
          activationGuide,
          keys: stagedKeys,
        },
      ],
    });
  };

  const inputClass =
    'h-11 w-full border-2 border-[#0e0917] bg-[#1a1224] px-4 text-sm font-medium text-white outline-none placeholder:text-[#786b88] focus:border-[#e5a93c] shadow-[2.5px_2.5px_0_#0e0917] transition-all';
  const labelClass = 'block font-display text-[9px] font-bold uppercase tracking-wider text-[#bcaecf] mb-1.5';

  return (
    <SellerLayout pageName="Add product" contentClassName="p-0">
      <div className="w-full mx-auto px-4 sm:px-6 md:px-10 lg:px-14 xl:px-24 2xl:px-36 3xl:px-48 py-6 sm:py-8 max-w-[1760px]">
        {/* Header Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="comic-kicker mb-3">Inventory management</span>
            <h1 className="comic-title text-3xl sm:text-4xl font-black">Add New Product</h1>
            <p className="mt-2 text-sm text-[#a99bb5]">
              Upload artwork, configure editions, and stage activation keys for your storefront.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="comic-action-btn flex h-11 items-center gap-2 border-2 border-[#0e0917] bg-[#211533] px-5 text-[10px] font-black uppercase text-[#d6c7ea] hover:bg-[#2c1c44] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Products
          </button>
        </div>

        {imageError && (
          <div className="mt-6 flex items-center gap-3 border-2 border-[#0e0917] bg-[#3a1a23] p-4 text-sm font-semibold text-[#ff8c98] shadow-[4px_4px_0_#0e0917]">
            <span className="grid h-6 w-6 place-items-center bg-[#ff5c80] text-[#0e0917] font-black text-xs">!</span>
            <span>{imageError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(340px,440px)_1fr] xl:gap-12 items-start">
            {/* LEFT COLUMN: LIVE STORE UI COVER ART PREVIEW */}
            <aside className="space-y-6 lg:sticky lg:top-[92px]">
              <div>
                <span className="font-display text-[10px] font-black uppercase tracking-wider text-[#e5a93c] mb-2 block">
                  Live Storefront Preview
                </span>

                {/* Comic Product Cover Box (Mirrors ProductDetailsPage / Catalog) */}
                <div className="comic-panel overflow-hidden border-2 border-[#0e0917] bg-[#140c1e] shadow-[6px_6px_0_#0e0917]">
                  {/* Top Image Frame */}
                  <div className="relative min-h-[380px] sm:min-h-[440px] flex items-center justify-center bg-[#170e24] overflow-hidden">
                    {imagePreviewUrl ? (
                      <img
                        src={imagePreviewUrl}
                        alt={title || 'Product preview'}
                        className="h-full w-full object-cover min-h-[380px] sm:min-h-[440px]"
                      />
                    ) : (
                      <div className="comic-halftone-purple flex flex-col items-center justify-center p-8 text-center min-h-[380px] sm:min-h-[440px] w-full">
                        <span className="grid h-16 w-16 place-items-center border-2 border-[#0e0917] bg-[#2a1a3e] text-[#e5a93c] shadow-[3px_3px_0_#0e0917] mb-4">
                          <ImageIcon className="h-8 w-8" />
                        </span>
                        <p className="font-display text-sm font-black uppercase text-white tracking-wide">
                          No Cover Image Selected
                        </p>
                        <p className="mt-2 text-xs text-[#a99bb5] max-w-xs leading-relaxed">
                          Click below to choose high-resolution game artwork. It will immediately preview here as shoppers see it.
                        </p>
                      </div>
                    )}

                    {/* Store Badges Overlaid on Artwork */}
                    <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                      <span className="border-2 border-[#0e0917] bg-[#581c87] px-2.5 py-1 font-display text-[9px] font-black uppercase text-[#e5a93c] shadow-[2px_2px_0_#0e0917] flex items-center gap-1">
                        <Monitor className="h-3 w-3" />
                        {selectedStoreName}
                      </span>
                      <span className="border-2 border-[#0e0917] bg-[#1e132b] px-2 py-1 font-display text-[9px] font-bold uppercase text-white shadow-[2px_2px_0_#0e0917] flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {selectedRegionName}
                      </span>
                    </div>

                    <div className="absolute right-3 top-3">
                      <span
                        className={`border-2 border-[#0e0917] px-2.5 py-1 font-display text-[9px] font-black uppercase shadow-[2px_2px_0_#0e0917] ${
                          status === 'ACTIVE'
                            ? 'bg-[#e5a93c] text-[#0e0917]'
                            : status === 'DRAFT'
                            ? 'bg-[#3b2354] text-[#d6c7ea]'
                            : 'bg-[#5c2438] text-[#ff8c98]'
                        }`}
                      >
                        {status}
                      </span>
                    </div>

                    {/* Slashed comic bottom energy stripe */}
                    <div className="absolute bottom-0 left-0 right-0 flex h-2 opacity-90">
                      <div className="h-full w-3/4 bg-[#e5a93c]" />
                      <div className="h-full w-1/4 bg-[#581c87]" />
                    </div>
                  </div>

                  {/* Bottom Preview Strip */}
                  <div className="border-t-2 border-[#0e0917] bg-[#1a1226] p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <span className="font-display text-[8px] font-bold uppercase tracking-wider text-[#a99bb5]">
                          {variantName || 'Standard Edition'}
                        </span>
                        <h3 className="font-display text-lg font-black uppercase text-white truncate mt-0.5">
                          {title || 'Untitled Product'}
                        </h3>
                        <p className="text-xs text-[#8f8398] mt-1">
                          {developer || 'Developer'} • {publisher || 'Publisher'}
                        </p>
                      </div>

                      {/* Comic Price Sticker */}
                      <div className="comic-price-sticker comic-halftone-yellow shrink-0 text-right">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#0e0917]/80 block">
                          Vault Price
                        </span>
                        <span className="font-display text-[19px] sm:text-[20px] font-black leading-none text-[#0e0917] block mt-0.5">
                          ${parseFloat(price || '0').toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Controls */}
              <div className="comic-panel p-5 space-y-3">
                <span className={labelClass}>Upload Artwork File</span>
                <label className="comic-action-btn flex h-11 w-full cursor-pointer items-center justify-center gap-2 border-2 border-[#0e0917] bg-[#e5a93c] px-4 text-[10px] font-black uppercase text-[#0e0917] hover:bg-[#f0b849] shadow-[2.5px_2.5px_0_#0e0917]">
                  <Upload className="h-4 w-4 stroke-[2.5]" />
                  <span>{imageFile ? 'Change Cover Artwork' : 'Upload Cover Artwork'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {imageFile && (
                  <div className="flex items-center justify-between border-2 border-[#0e0917] bg-[#221437] p-3 text-xs">
                    <div className="min-w-0 flex-1 truncate pr-2">
                      <p className="font-bold text-white truncate">{imageFile.name}</p>
                      <p className="text-[10px] text-[#a99bb5]">{(imageFile.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setImageFile(null)}
                      className="text-[#ff5c80] hover:text-white font-display text-[10px] uppercase font-bold"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <p className="text-[10px] text-[#8f8398]">
                  Recommended size: 600x800 or 1200x1600. Automatically compressed and optimized before publishing.
                </p>
              </div>

              {/* Live Status Summary Card */}
              <div className="comic-panel p-5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#a99bb5] flex items-center gap-1.5 font-bold">
                    <KeyRound className="h-3.5 w-3.5 text-[#e5a93c]" /> Staged Keys
                  </span>
                  <strong className="font-display font-black text-white">{stagedKeys.length} Keys</strong>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#a99bb5] flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#10b981]" /> Verification
                  </span>
                  <span className="font-display text-[9px] font-bold uppercase text-[#10b981]">Instant Deliver</span>
                </div>
              </div>
            </aside>

            {/* RIGHT COLUMN: FULL-WIDTH FORM CONTROLS */}
            <div className="space-y-7 min-w-0">
              {/* PANEL 1: Core Information */}
              <section className="comic-panel p-6 sm:p-8 space-y-5">
                <div className="border-b-2 border-[#0e0917] pb-4">
                  <span className="comic-kicker mb-1">Step 1</span>
                  <h2 className="font-display text-lg font-black uppercase text-white">General Information</h2>
                </div>

                <div>
                  <label htmlFor="title" className={labelClass}>Product Title *</label>
                  <input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g. Elden Ring: Shadow of the Erdtree"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="description" className={labelClass}>Description *</label>
                  <textarea
                    id="description"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    placeholder="Provide a comprehensive synopsis of the game or key product..."
                    className="w-full border-2 border-[#0e0917] bg-[#1a1224] p-4 text-sm font-medium text-white outline-none placeholder:text-[#786b88] focus:border-[#e5a93c] shadow-[2.5px_2.5px_0_#0e0917] transition-all resize-y"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="developer" className={labelClass}>Developer</label>
                    <input
                      id="developer"
                      value={developer}
                      onChange={(e) => setDeveloper(e.target.value)}
                      placeholder="e.g. FromSoftware Inc."
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="publisher" className={labelClass}>Publisher</label>
                    <input
                      id="publisher"
                      value={publisher}
                      onChange={(e) => setPublisher(e.target.value)}
                      placeholder="e.g. Bandai Namco Entertainment"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Listing Status *</label>
                    <Select
                      value={status}
                      onChange={setStatus}
                      options={statusOptions}
                      className="w-full"
                      triggerClassName="h-11 bg-[#1a1224] text-white border-2 border-[#0e0917] shadow-[2.5px_2.5px_0_#0e0917]"
                    />
                  </div>
                  <div>
                    <label htmlFor="rating" className={labelClass}>Rating (Score / Review)</label>
                    <input
                      id="rating"
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      placeholder="e.g. 9.5 / 10, Overwhelmingly Positive"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="tags" className={labelClass}>Tags / Genres (comma-separated)</label>
                    <input
                      id="tags"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="e.g. RPG, Action, Souls-like, Dark Fantasy"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="systemRequirements" className={labelClass}>System Requirements</label>
                    <input
                      id="systemRequirements"
                      value={systemRequirements}
                      onChange={(e) => setSystemRequirements(e.target.value)}
                      placeholder="e.g. GTX 1060, 16GB RAM, 60GB Storage"
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>

              {/* PANEL 2: Edition, Platform & Pricing */}
              <section className="comic-panel p-6 sm:p-8 space-y-5">
                <div className="border-b-2 border-[#0e0917] pb-4">
                  <span className="comic-kicker mb-1">Step 2</span>
                  <h2 className="font-display text-lg font-black uppercase text-white">Edition & Platform Setup</h2>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="variantName" className={labelClass}>Edition Name *</label>
                    <input
                      id="variantName"
                      value={variantName}
                      onChange={(e) => setVariantName(e.target.value)}
                      required
                      placeholder="e.g. Standard Edition, Deluxe Edition"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="price" className={labelClass}>Price ($ USD) *</label>
                    <input
                      id="price"
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                      placeholder="49.99"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-3">
                  <div>
                    <label className={labelClass}>Platform *</label>
                    <Select
                      value={storeId}
                      onChange={setStoreId}
                      options={storeOptions}
                      className="w-full"
                      triggerClassName="h-11 bg-[#1a1224] text-white border-2 border-[#0e0917] shadow-[2.5px_2.5px_0_#0e0917]"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Product Type *</label>
                    <Select
                      value={typeId}
                      onChange={setTypeId}
                      options={typeOptions}
                      className="w-full"
                      triggerClassName="h-11 bg-[#1a1224] text-white border-2 border-[#0e0917] shadow-[2.5px_2.5px_0_#0e0917]"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Region Restriction *</label>
                    <Select
                      value={region}
                      onChange={setRegion}
                      options={regionOptions}
                      className="w-full"
                      triggerClassName="h-11 bg-[#1a1224] text-white border-2 border-[#0e0917] shadow-[2.5px_2.5px_0_#0e0917]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="activationGuide" className={labelClass}>Redemption & Activation Guide</label>
                  <input
                    id="activationGuide"
                    value={activationGuide}
                    onChange={(e) => setActivationGuide(e.target.value)}
                    placeholder="Instructions on how the buyer redeems this game on their account"
                    className={inputClass}
                  />
                </div>
              </section>

              {/* PANEL 3: Activation Key Staging */}
              <section className="comic-panel p-6 sm:p-8 space-y-5">
                <div className="border-b-2 border-[#0e0917] pb-4 flex items-center justify-between">
                  <div>
                    <span className="comic-kicker mb-1">Step 3</span>
                    <h2 className="font-display text-lg font-black uppercase text-white">Vault License Keys</h2>
                  </div>
                  <span className="border-2 border-[#0e0917] bg-[#581c87] px-3 py-1 font-display text-[9px] font-black uppercase text-[#e5a93c] shadow-[2px_2px_0_#0e0917]">
                    {stagedKeys.length} Staged
                  </span>
                </div>

                <p className="text-xs text-[#a99bb5]">
                  Add activation keys for automatic instant delivery. You can add more keys later from the inventory management view.
                </p>

                <div className="flex gap-2">
                  <input
                    value={currentKey}
                    onChange={(e) => setCurrentKey(e.target.value)}
                    placeholder="e.g. ABCD-1234-EFGH-5678"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddKey();
                      }
                    }}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={handleAddKey}
                    className="comic-action-btn flex h-11 shrink-0 items-center gap-1.5 border-2 border-[#0e0917] bg-[#e5a93c] px-5 text-[10px] font-black uppercase text-[#0e0917] hover:bg-[#f0b849]"
                  >
                    <Plus className="h-4 w-4 stroke-[3]" /> Add Key
                  </button>
                </div>

                {stagedKeys.length > 0 && (
                  <div className="border-2 border-[#0e0917] bg-[#140c1e] p-4 max-h-56 overflow-y-auto space-y-2">
                    {stagedKeys.map((key) => (
                      <div
                        key={key}
                        className="flex items-center justify-between border-2 border-[#0e0917] bg-[#1f152b] px-3 py-2 text-xs font-mono font-bold text-white shadow-[1.5px_1.5px_0_#0e0917]"
                      >
                        <span className="tracking-wider">{key}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveKey(key)}
                          className="text-[#ff5c80] hover:text-white p-1 hover:bg-[#ff5c80]/20 rounded transition-colors"
                          title="Remove key"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* ACTION BAR */}
              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/admin/products')}
                  className="comic-action-btn h-12 border-2 border-[#0e0917] bg-[#221437] px-6 text-[11px] font-black uppercase text-white hover:bg-[#2c1c44]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="comic-action-btn flex h-12 items-center justify-center gap-2 border-2 border-[#0e0917] bg-[#e5a93c] px-8 text-[11px] font-black uppercase text-[#0e0917] hover:bg-[#f0b849] disabled:opacity-50"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-[#0e0917]" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 stroke-[3]" />
                      <span>Publish Product to Store</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </SellerLayout>
  );
}
