import { useState, useEffect } from 'react';
import { BadgeCheck, Info, Save, Upload, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AccountSidebar from '../../components/account/AccountSidebar';
import api from '../../lib/api';
import { toast } from '../../lib/toast';
import { ProfilePageSkeleton } from '../../components/ui/skeleton';

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    username: '',
    phone: '',
    email: '',
    address: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: serverProfile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get('/buyer/profile');
      return res.data;
    },
  });

  useEffect(() => {
    if (serverProfile) {
      setProfile({
        firstName: serverProfile.firstName || '',
        lastName: serverProfile.lastName || '',
        username: serverProfile.username || '',
        phone: serverProfile.phone || '',
        email: serverProfile.email || '',
        address: serverProfile.address || '',
      });
      if (serverProfile.profilePic) {
        setAvatarUrl(serverProfile.profilePic);
      }
    }
  }, [serverProfile]);

  const updateField = (field: keyof typeof profile, value: string) => {
    setSaved(false);
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const handleAvatar = (file?: File) => {
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(typeof reader.result === 'string' ? reader.result : null);
    reader.readAsDataURL(file);
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('firstName', profile.firstName);
      formData.append('lastName', profile.lastName);
      formData.append('username', profile.username);
      formData.append('phone', profile.phone);
      formData.append('address', profile.address);
      if (avatarFile) {
        formData.append('profilePic', avatarFile);
      }

      const res = await api.put('/buyer/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      setSaved(true);
      setErrorMsg(null);
      toast.success('Your profile details have been saved successfully.');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Failed to update profile';
      setErrorMsg(msg);
      toast.error(msg);
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    updateMutation.mutate();
  };

  const fieldClass = 'mt-2 h-12 w-full border border-[#5b4767] bg-[#1c191f] px-4 text-sm text-white outline-none placeholder:text-[#756b7b] focus:border-[#f4b72b]';

  if (isLoading) {
    return <ProfilePageSkeleton />;
  }

  return (
    <div className="grid items-start gap-10 pb-10 lg:grid-cols-[270px_1fr]">
      <AccountSidebar email={profile.email} avatarUrl={avatarUrl} />

      <main className="min-w-0">
        <span className="comic-kicker mb-5">Account center</span>
        <h1 className="comic-title text-3xl font-black sm:text-4xl">Profile information</h1>
        <p className="mt-3 text-[#a99bb5]">Manage your account details and contact information.</p>

        {saved && (
          <div className="mt-6 flex items-center gap-3 border border-[#3b7549] bg-[#1b3323] p-4 text-xs text-[#9ae6b4]">
            <BadgeCheck className="h-5 w-5 text-[#48bb78]" />
            Your profile details have been saved successfully.
          </div>
        )}

        {errorMsg && (
          <div className="mt-6 flex items-center gap-3 border border-[#743440] bg-[#3a1a23] p-4 text-xs text-[#ff8c98]">
            <Info className="h-5 w-5 text-[#ff8c98]" />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-9 space-y-8">
          <section className="comic-panel flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
            <span className="grid h-28 w-28 shrink-0 place-items-center overflow-hidden border-2 border-[#f4b72b] bg-[#6b2fa2] font-display text-2xl font-black text-white shadow-[5px_5px_0_#2c0c46]">
              {avatarUrl ? <img src={avatarUrl} alt="Profile preview" className="h-full w-full object-cover" /> : (profile.firstName?.[0] || 'U')}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-display text-lg font-black uppercase text-white">Avatar</h2>
                <span className="flex items-center gap-1 border border-[#5b4767] bg-[#1c191f] px-3 py-1 font-display text-[8px] font-bold uppercase text-[#f4b72b]">
                  <BadgeCheck className="h-3 w-3" /> PNG / JPG
                </span>
              </div>
              <p className="mt-2 text-sm text-[#a99bb5]">Upload a new profile picture. Max file size is 5MB.</p>
              <label className="font-display mt-4 inline-flex h-11 cursor-pointer items-center gap-2 border border-[#5b4767] bg-[#211d23] px-5 text-[9px] font-bold uppercase text-white hover:border-[#f4b72b]">
                <Upload className="h-4 w-4 text-[#f4b72b]" /> Choose image
                <input type="file" accept="image/*" onChange={(e) => handleAvatar(e.target.files?.[0])} className="hidden" />
              </label>
            </div>
          </section>

          <section className="comic-panel p-6 sm:p-8">
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block font-display text-[8px] font-bold uppercase text-[#a99bb5]">
                First name
                <input required value={profile.firstName} onChange={(e) => updateField('firstName', e.target.value)} className={fieldClass} />
              </label>
              <label className="block font-display text-[8px] font-bold uppercase text-[#a99bb5]">
                Last name
                <input required value={profile.lastName} onChange={(e) => updateField('lastName', e.target.value)} className={fieldClass} />
              </label>
              <label className="block font-display text-[8px] font-bold uppercase text-[#a99bb5]">
                Username
                <input required value={profile.username} onChange={(e) => updateField('username', e.target.value)} className={fieldClass} />
              </label>
              <label className="block font-display text-[8px] font-bold uppercase text-[#a99bb5]">
                Phone number
                <input value={profile.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="+63 900 000 0000" className={fieldClass} />
              </label>
              <label className="block font-display text-[8px] font-bold uppercase text-[#a99bb5] sm:col-span-2">
                Email address
                <input disabled value={profile.email} className={`${fieldClass} opacity-60 cursor-not-allowed`} />
              </label>
              <label className="block font-display text-[8px] font-bold uppercase text-[#a99bb5] sm:col-span-2">
                Address
                <input value={profile.address} onChange={(e) => updateField('address', e.target.value)} placeholder="Delivery / billing address" className={fieldClass} />
              </label>
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="font-display flex h-12 items-center gap-2 bg-[#f4b72b] px-7 text-[10px] font-black uppercase text-[#171419] hover:bg-[#ffd45e] disabled:opacity-50"
            >
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {updateMutation.isPending ? 'Saving changes...' : 'Save changes'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
