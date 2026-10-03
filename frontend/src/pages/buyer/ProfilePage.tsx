import { useState } from 'react';
import { BadgeCheck, Info, RotateCcw, Save, Upload } from 'lucide-react';
import AccountSidebar from '../../components/account/AccountSidebar';

const initialProfile = {
  firstName: 'John',
  lastName: 'Doe',
  username: 'johndoe_2026',
  phone: '+63 917 123 4567',
  email: 'john@example.com',
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(initialProfile);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const updateField = (field: keyof typeof initialProfile, value: string) => {
    setSaved(false);
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const resetProfile = () => {
    setProfile(initialProfile);
    setAvatarUrl(null);
    setSaved(false);
  };

  const handleAvatar = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(typeof reader.result === 'string' ? reader.result : null);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSaved(true);
  };

  const fieldClass = 'mt-2 h-12 w-full border border-[#5b4767] bg-[#1c191f] px-4 text-sm text-white outline-none placeholder:text-[#756b7b] focus:border-[#f4b72b]';

  return (
    <div className="grid items-start gap-10 pb-10 lg:grid-cols-[270px_1fr]">
      <AccountSidebar email={profile.email} avatarUrl={avatarUrl} />

      <main className="min-w-0">
        <span className="comic-kicker mb-5">Account center</span>
        <h1 className="comic-title text-3xl font-black sm:text-4xl">Profile information</h1>
        <p className="mt-3 text-[#a99bb5]">Manage your account details and contact information.</p>

        <form onSubmit={handleSubmit} className="mt-9 space-y-8">
          <section className="comic-panel flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
            <span className="grid h-28 w-28 shrink-0 place-items-center overflow-hidden border-2 border-[#f4b72b] bg-[#6b2fa2] font-display text-2xl font-black text-white shadow-[5px_5px_0_#2c0c46]">
              {avatarUrl ? <img src={avatarUrl} alt="Profile preview" className="h-full w-full object-cover" /> : 'JD'}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-display text-lg font-black uppercase text-white">Avatar</h2>
                <span className="flex items-center gap-1 border border-[#5b4767] bg-[#1c191f] px-3 py-1 font-display text-[8px] font-bold uppercase text-[#f4b72b]">
                  <BadgeCheck className="h-3 w-3" /> Verified account
                </span>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <label className="font-display inline-flex h-11 cursor-pointer items-center gap-2 bg-[#f4b72b] px-5 text-[10px] font-black uppercase text-[#171419] hover:bg-[#ffd45e]">
                  <Upload className="h-4 w-4" /> Change avatar
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => handleAvatar(event.target.files?.[0])} />
                </label>
                <button type="button" onClick={() => setAvatarUrl(null)} className="h-11 border border-[#5b4767] bg-[#1c191f] px-5 text-sm font-bold text-[#a99bb5] hover:border-[#f4b72b] hover:text-white">Remove</button>
              </div>
            </div>
          </section>

          <section className="grid gap-6 sm:grid-cols-2">
            <label className="font-display text-[10px] font-bold uppercase text-[#b9adc4]">
              First name
              <input value={profile.firstName} onChange={(event) => updateField('firstName', event.target.value)} className={fieldClass} />
            </label>
            <label className="font-display text-[10px] font-bold uppercase text-[#b9adc4]">
              Last name
              <input value={profile.lastName} onChange={(event) => updateField('lastName', event.target.value)} className={fieldClass} />
            </label>
            <label className="font-display text-[10px] font-bold uppercase text-[#b9adc4]">
              Display name / username
              <input value={profile.username} onChange={(event) => updateField('username', event.target.value)} className={fieldClass} />
            </label>
            <label className="font-display text-[10px] font-bold uppercase text-[#b9adc4]">
              Contact number
              <input value={profile.phone} onChange={(event) => updateField('phone', event.target.value)} className={fieldClass} />
            </label>
          </section>

          <section className="comic-panel p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label htmlFor="profile-email" className="font-display text-[10px] font-bold uppercase text-[#b9adc4]">Email address</label>
              <span className="border border-[#5b4767] bg-[#1c191f] px-3 py-1 font-display text-[8px] font-bold uppercase text-[#f4b72b]">Primary email verified</span>
            </div>
            <input id="profile-email" value={profile.email} readOnly className={`${fieldClass} opacity-80`} />
            <p className="mt-4 text-sm leading-6 text-[#8f8398]">This email receives digital keys and order receipts after each purchase.</p>
          </section>

          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" className="font-display flex h-12 items-center gap-2 bg-[#f4b72b] px-7 text-[10px] font-black uppercase text-[#171419] transition-transform hover:-translate-y-0.5 hover:bg-[#ffd45e]">
              <Save className="h-4 w-4" /> Save changes
            </button>
            <button type="button" onClick={resetProfile} className="font-display flex h-12 items-center gap-2 border border-[#5b4767] bg-[#211d23] px-7 text-[10px] font-bold uppercase text-[#b9adc4] hover:border-[#f4b72b] hover:text-white">
              <RotateCcw className="h-4 w-4" /> Cancel / Reset
            </button>
            {saved && <span className="flex items-center gap-2 text-sm font-bold text-[#f4b72b]"><BadgeCheck className="h-4 w-4" /> Changes saved locally</span>}
          </div>

          <div className="flex items-center gap-4 border border-dashed border-[#5b4767] bg-[#211d23] p-5">
            <span className="grid h-10 w-10 shrink-0 place-items-center bg-[#2b183c] text-[#f4b72b]"><Info className="h-5 w-5" /></span>
            <div>
              <p className="font-bold text-white">Need help updating your account?</p>
              <p className="mt-1 text-sm text-[#a99bb5]">Contact support@mystikeys.example</p>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
