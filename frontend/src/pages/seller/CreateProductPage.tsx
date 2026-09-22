import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { ImagePlus, Plus, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import SellerLayout from '../../components/seller/SellerLayout';

type ProductForm = {
  name: string;
  category: string;
  platform: string;
  region: string;
  description: string;
  status: string;
  sku: string;
  deliveryType: string;
  buyerField: string;
  options: Array<{ name: string; price: string; label: string }>;
};

const editDefaults: ProductForm = {
  name: 'Roblox Robux (Direct Top-Up)',
  category: 'Top-Ups',
  platform: 'Roblox',
  region: 'Global',
  description: 'Official top-up service for Roblox. Fast and secure.',
  status: 'Active',
  sku: 'MK-TU-ROBLOX',
  deliveryType: 'Direct top-up',
  buyerField: 'Player ID / User ID',
  options: [
    { name: '800 Robux', price: '550.00', label: "Gamer's choice" },
    { name: '1,700 Robux', price: '1,150.00', label: 'Standard' },
    { name: '4,500 Robux', price: '2,850.00', label: 'Standard' },
  ],
};

const newDefaults: ProductForm = {
  name: '', category: 'Game Keys', platform: 'Steam', region: 'Global', description: '', status: 'Draft', sku: '', deliveryType: 'Digital key', buyerField: 'Email address', options: [{ name: 'Standard edition', price: '', label: 'Standard' }],
};

const inputClass = 'h-11 w-full border border-[#5b4767] bg-[#1c191f] px-3 text-sm text-white outline-none placeholder:text-[#756b7b] focus:border-[#f4b72b]';
const labelClass = 'font-display text-[8px] font-bold uppercase text-[#a99bb5]';

export default function CreateProductPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState<string | null>(isEditing ? '/palworld-cover.jpg' : null);
  const [saved, setSaved] = useState(false);
  const { register, control, handleSubmit, formState: { errors } } = useForm<ProductForm>({ defaultValues: isEditing ? editDefaults : newDefaults });
  const { fields, append, remove } = useFieldArray({ control, name: 'options' });

  const handleImage = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageUrl(typeof reader.result === 'string' ? reader.result : null);
    reader.readAsDataURL(file);
  };

  const saveProduct = (_data: ProductForm) => {
    setSaved(true);
    window.setTimeout(() => navigate('/seller/products'), 700);
  };

  return (
    <SellerLayout pageName="Add / Edit Product">
      <form onSubmit={handleSubmit(saveProduct)}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div><span className="comic-kicker mb-4">Catalog editor</span><h1 className="comic-title text-3xl font-black">{isEditing ? 'Edit product' : 'Add product'}</h1><p className="mt-3 text-sm text-[#a99bb5]">Update the product information shown on the MystiKeys storefront.</p></div>
          <div className="flex gap-3"><button type="button" onClick={() => navigate('/seller/products')} className="font-display h-11 border border-[#5b4767] bg-[#211d23] px-5 text-[9px] font-bold uppercase text-white hover:border-[#f4b72b]">Cancel</button><button className="font-display h-11 bg-[#f4b72b] px-5 text-[9px] font-black uppercase text-[#171419] hover:bg-[#ffd45e]">{saved ? 'Saved' : 'Save product'}</button></div>
        </div>

        <div className="mt-7 grid items-start gap-6 xl:grid-cols-[340px_1fr]">
          <div className="space-y-6">
            <section className="border border-[#49345d] bg-[#252028] p-5">
              <h2 className="font-display text-xs font-black uppercase text-white">Product media</h2><p className="mt-2 text-xs text-[#8f8398]">Main image shown on the storefront product view.</p>
              <div className="mt-5 grid aspect-square place-items-center overflow-hidden border border-dashed border-[#5b4767] bg-[#1c191f]">
                {imageUrl ? <img src={imageUrl} alt="Product preview" className="h-full w-full object-cover" /> : <div className="text-center"><ImagePlus className="mx-auto h-9 w-9 text-[#f4b72b]" /><p className="font-display mt-4 text-[9px] font-bold uppercase text-white">Product image</p><p className="mt-2 text-xs text-[#756b7b]">PNG or JPG, recommended 1200 x 1200</p></div>}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3"><label className="font-display flex h-11 cursor-pointer items-center justify-center bg-[#f4b72b] text-[9px] font-black uppercase text-[#171419] hover:bg-[#ffd45e]">{imageUrl ? 'Replace image' : 'Choose image'}<input type="file" accept="image/*" className="hidden" onChange={(event) => handleImage(event.target.files?.[0])} /></label><button type="button" onClick={() => setImageUrl(null)} className="font-display h-11 border border-[#5b4767] bg-[#211d23] text-[9px] font-bold uppercase text-white hover:border-[#f4b72b]">Remove</button></div>
            </section>
            <section className="border border-[#49345d] bg-[#252028] p-5"><h2 className="font-display text-xs font-black uppercase text-white">Publishing</h2><label className={`${labelClass} mt-5 block`}>Status<select {...register('status')} className={`${inputClass} mt-2`}><option>Active</option><option>Draft</option><option>Archived</option></select></label><p className="mt-3 text-xs leading-5 text-[#8f8398]">Controls storefront visibility and availability.</p></section>
          </div>

          <div className="space-y-6">
            <section className="border border-[#49345d] bg-[#252028] p-5">
              <h2 className="font-display text-xs font-black uppercase text-white">Basic information</h2>
              <label className={`${labelClass} mt-5 block`}>Product name<input {...register('name', { required: true })} className={`${inputClass} mt-2`} />{errors.name && <span className="mt-1 block font-sans text-xs normal-case text-[#ff8c98]">Product name is required.</span>}</label>
              <div className="mt-5 grid gap-4 md:grid-cols-3"><label className={labelClass}>Category<select {...register('category')} className={`${inputClass} mt-2`}><option>Game Keys</option><option>Top-Ups</option><option>Subscriptions</option><option>Gift Cards</option></select></label><label className={labelClass}>Platform<select {...register('platform')} className={`${inputClass} mt-2`}><option>Steam</option><option>Roblox</option><option>Xbox / PC</option><option>PlayStation</option><option>Mobile</option></select></label><label className={labelClass}>Region<select {...register('region')} className={`${inputClass} mt-2`}><option>Global</option><option>SEA</option><option>Asia</option><option>US</option></select></label></div>
              <label className={`${labelClass} mt-5 block`}>Short description<textarea {...register('description', { required: true })} rows={3} className="mt-2 w-full resize-y border border-[#5b4767] bg-[#1c191f] p-3 font-sans text-sm normal-case text-white outline-none focus:border-[#f4b72b]" /></label>
            </section>

            <section className="border border-[#49345d] bg-[#252028] p-5">
              <div className="flex items-center justify-between gap-4"><h2 className="font-display text-xs font-black uppercase text-white">Purchase options</h2><button type="button" onClick={() => append({ name: '', price: '', label: 'Standard' })} className="font-display flex items-center gap-2 text-[8px] font-bold uppercase text-[#f4b72b]"><Plus className="h-4 w-4" /> Add option</button></div>
              <div className="mt-5 space-y-3">{fields.map((field, index) => <div key={field.id} className="grid gap-3 md:grid-cols-[1.4fr_0.75fr_0.75fr_auto]"><input aria-label={`Option ${index + 1} name`} {...register(`options.${index}.name`, { required: true })} placeholder="Option name" className={inputClass} /><input aria-label={`Option ${index + 1} price`} {...register(`options.${index}.price`, { required: true })} placeholder="Selling price" className={inputClass} /><select aria-label={`Option ${index + 1} label`} {...register(`options.${index}.label`)} className={inputClass}><option>Standard</option><option>Gamer's choice</option><option>Popular</option></select><button type="button" disabled={fields.length === 1} onClick={() => remove(index)} aria-label={`Remove option ${index + 1}`} className="grid h-11 w-11 place-items-center border border-[#5b4767] text-[#a99bb5] hover:border-[#f4b72b] hover:text-[#f4b72b] disabled:opacity-30"><Trash2 className="h-4 w-4" /></button></div>)}</div>
            </section>

            <section className="border border-[#49345d] bg-[#252028] p-5"><h2 className="font-display text-xs font-black uppercase text-white">Fulfillment and customer details</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><label className={labelClass}>SKU<input {...register('sku', { required: true })} className={`${inputClass} mt-2`} /></label><label className={labelClass}>Delivery type<select {...register('deliveryType')} className={`${inputClass} mt-2`}><option>Digital key</option><option>Direct top-up</option><option>Email delivery</option></select></label><label className={labelClass}>Required buyer field<select {...register('buyerField')} className={`${inputClass} mt-2`}><option>Email address</option><option>Player ID / User ID</option><option>Account region</option></select></label></div><p className="mt-4 text-xs text-[#8f8398]">Buyer input appears in the account details section of the storefront product view.</p></section>
          </div>
        </div>
      </form>
    </SellerLayout>
  );
}
