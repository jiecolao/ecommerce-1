import { useState } from 'react';
import { BadgeCheck, Headphones, KeyRound, Mail, Search, Send, UserRound } from 'lucide-react';

const supportTopics = [
  { id: 'payment', title: 'Payment problems', description: 'Billing, transactions, and failed payments', icon: Headphones },
  { id: 'key', title: 'Key not working', description: 'Invalid, used, or region-locked keys', icon: KeyRound },
  { id: 'account', title: 'Account access', description: 'Login issues and password support', icon: UserRound },
  { id: 'general', title: 'General inquiry', description: 'Questions about our store and services', icon: Search },
];

export default function ContactSupportPage() {
  const [selectedTopic, setSelectedTopic] = useState('payment');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    event.currentTarget.reset();
  };

  return (
    <div className="pb-8">
      <header className="py-8 text-center sm:py-12">
        <span className="comic-kicker mb-5">Human support</span>
        <h1 className="comic-title text-3xl font-black sm:text-4xl">Contact support</h1>
        <p className="mt-3 text-[#a99bb5]">Choose a category or send us a message below.</p>
      </header>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {supportTopics.map(({ id, title, description, icon: TopicIcon }) => {
          const isSelected = selectedTopic === id;
          return (
            <button key={id} onClick={() => setSelectedTopic(id)} className={`min-h-40 border p-6 text-center transition-transform hover:-translate-y-1 ${isSelected ? 'border-[#f4b72b] bg-[#2b183c] shadow-[5px_5px_0_#2c0c46]' : 'border-[#49345d] bg-[#211d23]'}`}>
              <span className={`mx-auto grid h-11 w-11 place-items-center ${isSelected ? 'bg-[#f4b72b] text-[#171419]' : 'bg-[#2b183c] text-[#f4b72b]'}`}><TopicIcon className="h-5 w-5" /></span>
              <h2 className="font-display mt-5 text-[10px] font-black uppercase text-white">{title}</h2>
              <p className="mt-2 text-xs leading-5 text-[#a99bb5]">{description}</p>
            </button>
          );
        })}
      </section>

      <div className="mt-12 grid items-start gap-8 lg:grid-cols-[1fr_300px]">
        <section>
          <h2 className="comic-title text-2xl font-black">Send us a message</h2>
          <p className="mt-3 text-sm text-[#a99bb5]">Fill out the form and our team will get back to you shortly.</p>
          <form onSubmit={handleSubmit} className="mt-7 grid gap-5 sm:grid-cols-2">
            <label className="font-display text-[9px] font-bold uppercase text-[#b9adc4]">Name<input required name="name" placeholder="Your name" className="mt-2 h-12 w-full border border-[#5b4767] bg-[#211d23] px-4 font-sans text-sm normal-case text-white outline-none placeholder:text-[#756b7b] focus:border-[#f4b72b]" /></label>
            <label className="font-display text-[9px] font-bold uppercase text-[#b9adc4]">Email address<input required type="email" name="email" placeholder="example@email.com" className="mt-2 h-12 w-full border border-[#5b4767] bg-[#211d23] px-4 font-sans text-sm normal-case text-white outline-none placeholder:text-[#756b7b] focus:border-[#f4b72b]" /></label>
            <label className="font-display text-[9px] font-bold uppercase text-[#b9adc4]">Order ID <span className="text-[#756b7b]">(optional)</span><input name="orderId" placeholder="#MK-12345" className="mt-2 h-12 w-full border border-[#5b4767] bg-[#211d23] px-4 font-sans text-sm normal-case text-white outline-none placeholder:text-[#756b7b] focus:border-[#f4b72b]" /></label>
            <label className="font-display text-[9px] font-bold uppercase text-[#b9adc4]">Subject<select name="subject" value={selectedTopic} onChange={(event) => setSelectedTopic(event.target.value)} className="mt-2 h-12 w-full border border-[#5b4767] bg-[#211d23] px-4 font-sans text-sm normal-case text-white outline-none focus:border-[#f4b72b]"><option value="payment">Payment problems</option><option value="key">Key not working</option><option value="account">Account access</option><option value="general">General inquiry</option></select></label>
            <label className="font-display text-[9px] font-bold uppercase text-[#b9adc4] sm:col-span-2">Message<textarea required name="message" rows={6} placeholder="Describe your issue in detail..." className="mt-2 w-full resize-y border border-[#5b4767] bg-[#211d23] p-4 font-sans text-sm normal-case text-white outline-none placeholder:text-[#756b7b] focus:border-[#f4b72b]" /></label>
            <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
              <button className="font-display flex h-12 items-center gap-2 bg-[#f4b72b] px-7 text-[10px] font-black uppercase text-[#171419] hover:bg-[#ffd45e]"><Send className="h-4 w-4" /> Send message</button>
              {submitted && <span className="flex items-center gap-2 text-sm font-bold text-[#f4b72b]"><BadgeCheck className="h-5 w-5" /> Message saved locally</span>}
            </div>
          </form>
        </section>

        <aside className="comic-panel p-6">
          <h2 className="font-display text-xs font-black uppercase text-white">Contact info</h2>
          <p className="mt-4 text-sm text-[#a99bb5]">Typical reply within two hours.</p>
          <a href="mailto:support@mystikeys.example" className="mt-6 flex items-center gap-3 border-t border-[#49345d] pt-5 text-sm text-white hover:text-[#f4b72b]"><Mail className="h-4 w-4" /> support@mystikeys.example</a>
        </aside>
      </div>
    </div>
  );
}
