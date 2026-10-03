import { useMemo, useState } from 'react';
import { ChevronDown, Gamepad2, Headphones, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const faqSections = [
  {
    id: 'general', title: 'General', questions: [
      { question: 'How does MystiKeys deliver my products?', answer: 'Digital keys and top-up confirmations are delivered instantly to your email address. Purchased keys also appear in Purchase History after payment is confirmed.' },
      { question: 'Are the game keys official and legitimate?', answer: 'Yes. MystiKeys lists verified digital keys sourced through trusted distribution channels for their stated platform and region.' },
      { question: 'Do I need an account to make a purchase?', answer: 'No. Guest checkout is available. Provide a valid email so we can deliver your activation key and receipt.' },
    ],
  },
  {
    id: 'payments', title: 'Payments', questions: [
      { question: 'What payment methods do you support?', answer: 'The prototype supports GCash, Maya, PayPal, credit or debit cards, and QR PH payment channels.' },
      { question: "My payment was successful but I haven't received my key.", answer: 'Check your inbox and spam folder first. If the key is not in Purchase History after 15 minutes, contact support with your order ID.' },
    ],
  },
  {
    id: 'activation', title: 'Key Activation', questions: [
      { question: 'How do I activate a Steam Wallet Code?', answer: 'Open Steam, choose Games, select Redeem a Steam Wallet Code, then paste the code shown in your completed order.' },
      { question: "What should I do if a key shows as 'Already Redeemed'?", answer: 'Confirm that the code was entered on the correct platform and account. If the issue remains, contact support so the order can be verified.' },
    ],
  },
  {
    id: 'refunds', title: 'Refunds', questions: [
      { question: 'Can I get a refund if I change my mind?', answer: 'Unused and unrevealed keys may be reviewed for a refund. Revealed or redeemed digital keys cannot normally be returned.' },
    ],
  },
  {
    id: 'support', title: 'Support', questions: [
      { question: 'How quickly does support respond?', answer: 'Typical replies arrive within two hours. Include your order ID and the email used during checkout to help us resolve the issue faster.' },
    ],
  },
];

export default function FAQPage() {
  const [query, setQuery] = useState('');
  const [openQuestion, setOpenQuestion] = useState(faqSections[0].questions[0].question);
  const [activeCategory, setActiveCategory] = useState('general');

  const visibleSections = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return faqSections;
    return faqSections.map((section) => ({
      ...section,
      questions: section.questions.filter(({ question, answer }) => `${question} ${answer}`.toLowerCase().includes(normalizedQuery)),
    })).filter((section) => section.questions.length > 0);
  }, [query]);

  const jumpToCategory = (id: string) => {
    setActiveCategory(id);
    document.getElementById(`faq-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="pb-8">
      <header className="py-8 text-center sm:py-12">
        <span className="comic-kicker mb-5">Support vault</span>
        <h1 className="comic-title text-3xl font-black sm:text-4xl">Frequently asked questions</h1>
        <p className="mt-3 text-[#a99bb5]">Everything you need to know about game keys, top-ups, and our services.</p>
        <label className="mx-auto mt-7 flex h-12 max-w-xl items-center gap-3 border border-[#5b4767] bg-[#211d23] px-4">
          <Search className="h-5 w-5 text-[#f4b72b]" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search for answers..." className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#756b7b]" />
        </label>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[220px_1fr]">
        <nav className="space-y-2 lg:sticky lg:top-28">
          {faqSections.map((section) => (
            <button key={section.id} onClick={() => jumpToCategory(section.id)} className={`font-display h-12 w-full px-4 text-left text-[9px] font-bold uppercase transition-transform hover:translate-x-1 ${activeCategory === section.id ? 'bg-[#f4b72b] text-[#171419]' : 'border border-transparent text-[#a99bb5] hover:border-[#49345d] hover:bg-[#211d23] hover:text-white'}`}>{section.title}</button>
          ))}
        </nav>

        <main className="min-w-0 space-y-9">
          {visibleSections.map((section) => (
            <section key={section.id} id={`faq-${section.id}`} className="scroll-mt-28">
              <div className="mb-4 flex items-center gap-3"><h2 className="font-display text-sm font-black uppercase text-white">{section.title}</h2><span className="h-px flex-1 bg-[#49345d]" /></div>
              <div className="space-y-3">
                {section.questions.map(({ question, answer }) => {
                  const isOpen = openQuestion === question;
                  return (
                    <article key={question} className={`border ${isOpen ? 'border-[#f4b72b] bg-[#2b183c]' : 'border-[#49345d] bg-[#211d23]'}`}>
                      <button onClick={() => setOpenQuestion(isOpen ? '' : question)} className="flex min-h-14 w-full items-center justify-between gap-5 px-5 py-4 text-left">
                        <span className="font-bold text-white">{question}</span>
                        <ChevronDown className={`h-4 w-4 shrink-0 text-[#f4b72b] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isOpen && <p className="border-t border-[#5b4767] px-5 py-5 text-sm leading-6 text-[#c0b5c7]">{answer}</p>}
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
          {visibleSections.length === 0 && <div className="border border-dashed border-[#5b4767] bg-[#211d23] px-6 py-14 text-center text-[#a99bb5]">No answers matched your search.</div>}
        </main>
      </div>

      <section className="comic-panel mt-12 flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div><h2 className="font-display text-lg font-black uppercase text-white">Still need help?</h2><p className="mt-2 text-sm text-[#a99bb5]">Our support team is available to help with any issue.</p></div>
        <div className="flex flex-wrap gap-3">
          <Link to="/contact" className="font-display flex h-11 items-center gap-2 bg-[#f4b72b] px-5 text-[9px] font-black uppercase text-[#171419] hover:bg-[#ffd45e]"><Headphones className="h-4 w-4" /> Contact support</Link>
          <a href="https://store.steampowered.com" className="font-display flex h-11 items-center gap-2 border border-[#5b4767] bg-[#1c191f] px-5 text-[9px] font-bold uppercase text-white hover:border-[#f4b72b]"><Gamepad2 className="h-4 w-4" /> Open Steam</a>
        </div>
      </section>
    </div>
  );
}
