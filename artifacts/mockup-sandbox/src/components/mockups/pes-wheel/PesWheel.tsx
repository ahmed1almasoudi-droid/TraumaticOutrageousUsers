import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  ChevronLeft,
  CircleHelp,
  Clock3,
  Gift,
  History,
  House,
  Menu,
  RotateCw,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";

type View = "wheel" | "prizes" | "missions" | "account";

const prizes = [
  { amount: 130, color: "#d8a62f", textColor: "#221537" },
  { amount: 300, color: "#0e8178", textColor: "#f9e5ab" },
  { amount: 550, color: "#bd5d35", textColor: "#fff3c4" },
  { amount: 750, color: "#5946a4", textColor: "#f8e7ac" },
  { amount: 1040, color: "#176c7c", textColor: "#fff1b8" },
  { amount: 2130, color: "#bf9227", textColor: "#20142d" },
  { amount: 3250, color: "#973b68", textColor: "#ffe6ae" },
  { amount: 5700, color: "#375c9c", textColor: "#fff2b9" },
  { amount: 12800, color: "#733b92", textColor: "#ffe8a4" },
  { amount: 50, color: "#8c4d31", textColor: "#ffecc2" },
];

const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value);

function CoinStack({ small = false }: { small?: boolean }) {
  return (
    <span className={small ? "relative inline-flex h-5 w-7 shrink-0" : "relative inline-flex h-7 w-9 shrink-0"} aria-hidden="true">
      <span className="absolute bottom-0 left-0 h-4 w-4 rounded-full border-2 border-[#f5bf31] bg-[#f9d95c] shadow-[inset_0_-2px_0_#c68717]">
        <span className="absolute inset-x-0 top-1/2 h-px bg-[#c68717]" />
      </span>
      <span className="absolute bottom-1 left-2 h-4 w-4 rounded-full border-2 border-[#f5bf31] bg-[#ffe370] shadow-[inset_0_-2px_0_#c68717]">
        <span className="absolute inset-x-0 top-1/2 h-px bg-[#c68717]" />
      </span>
      <span className="absolute right-0 top-0 h-4 w-4 rounded-full border-2 border-[#f5bf31] bg-[#f9d95c] shadow-[inset_0_-2px_0_#c68717]">
        <span className="absolute inset-x-0 top-1/2 h-px bg-[#c68717]" />
      </span>
    </span>
  );
}

function Welcome({ onEnter }: { onEnter: () => void }) {
  return (
    <section className="relative flex min-h-[100dvh] w-full max-w-[390px] flex-col items-center justify-between overflow-hidden bg-[#09091d] px-6 pb-7 pt-12 text-center text-[#fff8e7]" dir="rtl">
      <div className="stadium-lines pointer-events-none absolute inset-0 opacity-80" />
      <div className="pointer-events-none absolute -left-24 top-20 h-64 w-64 rounded-full bg-[#9e3f83]/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-24 h-72 w-72 rounded-full bg-[#d89426]/15 blur-3xl" />
      <div className="relative z-10 flex w-full items-center justify-between text-[10px] tracking-[0.18em] text-[#c9b7df]">
        <span className="rounded-full border border-[#e1a93f]/40 bg-[#211533]/70 px-3 py-1.5">تجربة محلية</span>
        <span className="flex items-center gap-1.5"><Sparkles className="h-3 w-3 text-[#f4c84f]" /> هدية اليوم</span>
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center pb-8">
        <div className="welcome-mark mb-7 flex h-20 w-20 items-center justify-center rounded-[28px] border border-[#f4c84f]/50 bg-[linear-gradient(145deg,#5b2e81,#1b1647)] shadow-[0_0_50px_rgba(184,91,229,.28),inset_0_1px_0_rgba(255,240,177,.35)]">
          <div className="relative h-12 w-12 rounded-full border-[5px] border-[#f7d65d]">
            <div className="absolute inset-[7px] rounded-full bg-[#efba38]" />
            <div className="absolute -right-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#fff1b5]" />
          </div>
        </div>
        <p className="mb-3 text-xs font-medium tracking-[0.28em] text-[#e2c974]">PES MOBILE</p>
        <h1 className="mb-4 text-[42px] font-black leading-[1.1] text-[#fff1a6] [text-shadow:0_4px_24px_rgba(239,159,37,.28)]">
          عجلة الحظ
        </h1>
        <p className="max-w-[250px] text-base leading-8 text-[#ece3f0]">
          كل يوم فرصة جديدة<br />
          <span className="font-bold text-[#f4c84f]">اجمع عملاتك وابدأ الهجمة</span>
        </p>
      </div>

      <div className="relative z-10 w-full">
        <button
          type="button"
          onClick={onEnter}
          className="group w-full rounded-2xl border border-[#ffe37d]/60 bg-[linear-gradient(105deg,#f3b829,#ffe36d_48%,#d78e1e)] px-5 py-4 text-[17px] font-black text-[#261533] shadow-[0_10px_28px_rgba(224,150,35,.25)] transition-transform active:scale-[.98]"
          aria-label="ابدأ اللعب"
        >
          <span className="flex items-center justify-center gap-3">
            <span>ابدأ اللعب</span>
            <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          </span>
        </button>
        <p className="mt-3 text-[10px] text-[#a89abf]">لفّة مجانية كل 24 ساعة</p>
      </div>
    </section>
  );
}

function Wheel({ rotation, spinning }: { rotation: number; spinning: boolean }) {
  const segmentAngle = 360 / prizes.length;
  const gradient = useMemo(
    () => `conic-gradient(from -18deg, ${prizes.map((prize, index) => `${prize.color} ${index * segmentAngle}deg ${(index + 1) * segmentAngle - 1.2}deg`).join(", ")})`,
    [segmentAngle],
  );

  return (
    <div className="relative mx-auto h-[282px] w-[282px] shrink-0 sm:h-[304px] sm:w-[304px]">
      <div className="absolute inset-[-13px] rounded-full border border-[#e8a93b]/45 bg-[#190e32] shadow-[0_0_0_5px_#3b1d63,0_0_34px_rgba(148,62,202,.58),inset_0_0_18px_rgba(255,192,61,.32)]" />
      <div className="absolute inset-[-5px] rounded-full border-[3px] border-[#f1bb43] opacity-90" />
      <div
        className={`absolute inset-0 rounded-full border-[8px] border-[#43216f] shadow-[inset_0_0_0_3px_#e29c31] ${spinning ? "wheel-spin" : ""}`}
        style={{ background: gradient, transform: `rotate(${rotation}deg)` }}
      >
        {prizes.map((prize, index) => {
          const angle = index * segmentAngle + segmentAngle / 2 - 90;
          const rad = angle * (Math.PI / 180);
          const x = 50 + Math.cos(rad) * 37;
          const y = 50 + Math.sin(rad) * 37;
          return (
            <div
              key={prize.amount}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 text-center"
              style={{ left: `${x}%`, top: `${y}%`, transform: `translate(-50%, -50%) rotate(${-rotation}deg)` }}
            >
              <strong className="text-[15px] font-black tracking-tight drop-shadow-[0_2px_2px_rgba(0,0,0,.55)]">{formatNumber(prize.amount)}</strong>
              <CoinStack small />
            </div>
          );
        })}
        <div className="absolute inset-[31%] flex items-center justify-center rounded-full border-[5px] border-[#f1c448] bg-[radial-gradient(circle_at_35%_30%,#8153bb,#271550_65%)] shadow-[0_0_18px_rgba(255,201,61,.45)]">
          <div className="flex h-[74%] w-[74%] items-center justify-center rounded-full border border-[#e7b83e]/80 bg-[#18102e]">
            <RotateCw className="h-7 w-7 text-[#f8ce53]" />
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute -top-[27px] left-1/2 z-20 -translate-x-1/2">
        <div className="relative flex h-12 w-10 items-center justify-center rounded-t-full rounded-b-[13px] border-2 border-[#ffe27b] bg-[#8e3b9b] shadow-[0_4px_14px_rgba(0,0,0,.42)]">
          <div className="h-4 w-4 rounded-full border-2 border-[#fff1a9] bg-[#f7c932]" />
          <div className="absolute -bottom-3 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-[#ffe27b] bg-[#8e3b9b]" />
        </div>
      </div>
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <span
          key={angle}
          className="absolute h-2.5 w-2.5 rounded-full border border-[#fff1ac] bg-[#e7a92d] shadow-[0_0_8px_#f8b83c]"
          style={{ left: `${50 + Math.cos((angle - 90) * (Math.PI / 180)) * 51}%`, top: `${50 + Math.sin((angle - 90) * (Math.PI / 180)) * 51}%`, transform: "translate(-50%, -50%)" }}
        />
      ))}
    </div>
  );
}

function BottomNav({ active, onChange }: { active: View; onChange: (view: View) => void }) {
  const items: Array<{ id: View; label: string; icon: typeof House }> = [
    { id: "wheel", label: "العجلة", icon: House },
    { id: "prizes", label: "جوائزي", icon: Gift },
    { id: "missions", label: "المهام", icon: Target },
    { id: "account", label: "حسابي", icon: UserRound },
  ];
  return (
    <nav className="relative z-20 grid grid-cols-4 gap-1 border-t border-[#6b4a91]/30 bg-[#100c28]/95 px-2 pb-[max(12px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl" aria-label="التنقل الرئيسي">
      {items.map(({ id, label, icon: Icon }) => (
        <button key={id} type="button" onClick={() => onChange(id)} className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] transition-colors ${active === id ? "bg-[#302052] text-[#f8d35c]" : "text-[#a89dbc] hover:bg-[#21183b] hover:text-[#efe0f6]"}`} aria-label={label}>
          <Icon className="h-[19px] w-[19px]" strokeWidth={active === id ? 2.5 : 1.7} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

function UtilityView({ view, balance, onBack }: { view: Exclude<View, "wheel">; balance: number; onBack: () => void }) {
  const content = {
    prizes: {
      icon: History,
      title: "سجل الجوائز",
      subtitle: "كل ما جمعته من العجلة",
      body: "لم تسجل أي لفّة بعد. ابدأ من العجلة لتظهر جوائزك هنا.",
      cta: "العودة إلى العجلة",
    },
    missions: {
      icon: Target,
      title: "المهام اليومية",
      subtitle: "خطوات بسيطة، مكافآت أكبر",
      body: "لفّ العجلة اليوم لتحصل على أول ختم في مهمتك.",
      cta: "ابدأ المهمة",
    },
    account: {
      icon: UserRound,
      title: "حسابي",
      subtitle: "مساحتك في PES Mobile",
      body: `رصيدك الحالي ${formatNumber(balance)} عملة. عد غدًا للمحاولة التالية.`,
      cta: "العودة إلى العجلة",
    },
  }[view];
  const Icon = content.icon;
  return (
    <div className="flex flex-1 flex-col px-5 pb-5 pt-6" dir="rtl">
      <button type="button" onClick={onBack} className="mb-8 flex w-fit items-center gap-2 text-sm text-[#c8b7d8] transition-colors hover:text-[#f6d45e]">
        <ChevronLeft className="h-4 w-4" /> العجلة الرئيسية
      </button>
      <div className="flex flex-col items-center rounded-[28px] border border-[#6c4c90]/45 bg-[linear-gradient(155deg,rgba(55,35,86,.78),rgba(20,14,47,.9))] px-6 py-10 text-center shadow-[0_18px_40px_rgba(3,2,18,.2)]">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#edc44d]/45 bg-[#28194c] text-[#f4cd56]"><Icon className="h-7 w-7" /></div>
        <h2 className="text-2xl font-black text-[#fff1bb]">{content.title}</h2>
        <p className="mt-2 text-sm text-[#c3b4d1]">{content.subtitle}</p>
        <div className="my-7 h-px w-full bg-[#8865a5]/25" />
        <p className="max-w-[245px] text-sm leading-7 text-[#e4dce9]">{content.body}</p>
        <button type="button" onClick={onBack} className="mt-7 rounded-xl border border-[#f3cc55]/45 bg-[#f3bf3c] px-6 py-3 text-sm font-bold text-[#281631]">{content.cta}</button>
      </div>
    </div>
  );
}

export function PesWheel() {
  const [welcome, setWelcome] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeView, setActiveView] = useState<View>("wheel");
  const [balance, setBalance] = useState(1250);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setWelcome(false), 3200);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!cooldown) return;
    const timer = window.setInterval(() => setCooldown((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const countdown = `${String(Math.floor(cooldown / 3600)).padStart(2, "0")}:${String(Math.floor((cooldown % 3600) / 60)).padStart(2, "0")}:${String(cooldown % 60).padStart(2, "0")}`;

  const handleSpin = () => {
    if (spinning || cooldown > 0) return;
    const prizeIndex = Math.floor(Math.random() * prizes.length);
    const prize = prizes[prizeIndex].amount;
    const segmentAngle = 360 / prizes.length;
    const target = 360 * 5 + (360 - (prizeIndex * segmentAngle + segmentAngle / 2)) + (Math.random() * 8 - 4);
    setResult(null);
    setSpinning(true);
    setRotation((current) => current + target);
    window.setTimeout(() => {
      setBalance((current) => current + prize);
      setResult(prize);
      setSpinning(false);
      setCooldown(24 * 60 * 60);
    }, 3600);
  };

  if (welcome) return <Welcome onEnter={() => setWelcome(false)} />;

  return (
    <main className="relative flex min-h-[100dvh] w-full max-w-[390px] flex-col overflow-hidden bg-[#0a091f] text-[#fff8eb]" dir="rtl">
      <div className="stadium-lines pointer-events-none absolute inset-0 opacity-50" />
      <div className="pointer-events-none absolute -left-36 top-24 h-80 w-80 rounded-full bg-[#71378f]/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-[43%] h-96 w-96 rounded-full bg-[#c77f2e]/10 blur-3xl" />
      <header className="relative z-10 flex items-center justify-between px-5 pb-3 pt-[max(20px,env(safe-area-inset-top))]">
        <button type="button" onClick={() => setDrawerOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#77539a]/50 bg-[#1a1235]/85 text-[#f6d45e] transition-colors hover:bg-[#2d1e4f]" aria-label="فتح القائمة">
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex flex-col items-center leading-none">
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#ebc74c]">PES</span>
          <span className="mt-1 text-[15px] font-black tracking-[0.07em] text-[#fff2c7]">FOOTBALL</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-[#8461a8]/45 bg-[#1a1235]/90 px-2.5 py-1.5">
          <CoinStack small />
          <div className="text-right leading-tight">
            <p className="text-[9px] text-[#bdb0cc]">رصيدك</p>
            <p className="text-sm font-black text-[#ffdf69]">{formatNumber(balance)}</p>
          </div>
        </div>
      </header>

      {activeView === "wheel" ? (
        <div className="relative z-10 flex flex-1 flex-col items-center px-5 pb-4 pt-1">
          <div className="mb-4 text-center">
            <p className="mb-1 text-[10px] font-bold tracking-[0.22em] text-[#c798d1]">مكافأة اليوم</p>
            <h1 className="text-[27px] font-black text-[#fff0af] [text-shadow:0_3px_20px_rgba(238,177,54,.2)]">عجلة الحظ</h1>
            <p className="mt-1 text-xs text-[#d3c4dd]">لفّ واربح عملاتك المجانية</p>
          </div>
          <div className="relative mt-2 flex w-full justify-center">
            <Wheel rotation={rotation} spinning={spinning} />
          </div>
          <div className="mt-7 flex w-full flex-col items-center">
            <button
              type="button"
              onClick={handleSpin}
              disabled={spinning || cooldown > 0}
              className={`group w-full max-w-[280px] rounded-2xl border px-5 py-3.5 text-[17px] font-black transition-transform active:scale-[.98] ${spinning || cooldown > 0 ? "cursor-not-allowed border-[#8c789b]/40 bg-[#493953] text-[#b6aabd]" : "border-[#ffe274] bg-[linear-gradient(105deg,#e6a825,#ffe16d_50%,#d68e1b)] text-[#28152f] shadow-[0_9px_26px_rgba(227,158,38,.28)]"}`}
              aria-label={spinning ? "العجلة تدور" : cooldown > 0 ? "اللف غير متاح الآن" : "لف العجلة"}
            >
              <span className="flex items-center justify-center gap-3">
                <RotateCw className={`h-5 w-5 ${spinning ? "animate-spin" : "transition-transform group-hover:rotate-45"}`} />
                {spinning ? "جاري الدوران..." : cooldown > 0 ? "عد غدًا للمحاولة" : "لف العجلة"}
              </span>
            </button>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-[#bdaecb]">
              <Clock3 className="h-3.5 w-3.5 text-[#e7bd50]" />
              {cooldown > 0 ? <><span>اللفّة التالية بعد</span><b className="font-mono tracking-wider text-[#f4d35e]" dir="ltr">{countdown}</b></> : <span>لفّة مجانية متاحة الآن</span>}
            </div>
          </div>
          <div className="mt-auto flex items-center gap-2 pt-3 text-[9px] text-[#8e7da2]">
            <ShieldCheck className="h-3 w-3 text-[#c8a2d9]" /> تجربة محلية — الجوائز للتوضيح فقط
          </div>
        </div>
      ) : (
        <UtilityView view={activeView} balance={balance} onBack={() => setActiveView("wheel")} />
      )}

      <BottomNav active={activeView} onChange={setActiveView} />

      {result !== null && (
        <div className="absolute inset-x-4 bottom-[100px] z-40 rounded-2xl border border-[#eac14f]/55 bg-[linear-gradient(135deg,#362052,#17102f)] p-4 shadow-[0_18px_50px_rgba(0,0,0,.5)]" role="status" aria-live="polite">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f0bc3e]/15 text-[#f6cc50]"><Trophy className="h-6 w-6" /></div>
            <div className="flex-1 text-right">
              <p className="text-[11px] text-[#cdbbd8]">مبروك! ربحت</p>
              <p className="mt-0.5 flex items-center justify-end gap-2 text-lg font-black text-[#ffdf68]" dir="rtl"><CoinStack small /> {formatNumber(result)} عملة</p>
            </div>
            <button type="button" onClick={() => setResult(null)} className="self-start text-[#aa96bb] hover:text-[#fff1bd]" aria-label="إغلاق النتيجة"><X className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      {drawerOpen && (
        <div className="absolute inset-0 z-50 bg-[#080718]/70 backdrop-blur-[2px]" onClick={() => setDrawerOpen(false)}>
          <aside className="absolute right-0 top-0 flex h-full w-[82%] flex-col border-l border-[#765193]/45 bg-[linear-gradient(175deg,#21153d,#0d0a22_70%)] p-5 shadow-[-12px_0_36px_rgba(0,0,0,.35)]" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#806199]/25 pb-5">
              <div><p className="text-xs text-[#bba2c9]">مساحة التطوير القادمة</p><h2 className="mt-1 text-xl font-black text-[#ffe9a5]">المزيد من اللعب</h2></div>
              <button type="button" onClick={() => setDrawerOpen(false)} className="rounded-lg p-2 text-[#c2afcf] hover:bg-[#362452]" aria-label="إغلاق القائمة"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-5 space-y-3">
              {[
                { label: "سجل الجوائز", caption: "تابع كل ربح", icon: History, view: "prizes" as View },
                { label: "المهام اليومية", caption: "مكافآت مع كل إنجاز", icon: Target, view: "missions" as View },
                { label: "تنبيهات اللفّة", caption: "لن تفوّت فرصتك", icon: Bell, view: "wheel" as View },
                { label: "حسابك", caption: "ملف اللاعب والرصيد", icon: WalletCards, view: "account" as View },
              ].map(({ label, caption, icon: Icon, view }) => (
                <button key={label} type="button" onClick={() => { setActiveView(view); setDrawerOpen(false); }} className="flex w-full items-center gap-3 rounded-2xl border border-[#73518e]/30 bg-[#2a1b48]/60 p-3 text-right transition-colors hover:border-[#d1a647]/50 hover:bg-[#362451]">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e4b842]/10 text-[#e9bf4b]"><Icon className="h-5 w-5" /></span>
                  <span className="flex-1"><span className="block text-sm font-bold text-[#f4e5bd]">{label}</span><span className="mt-0.5 block text-[10px] text-[#ae9dbb]">{caption}</span></span>
                  <ChevronLeft className="h-4 w-4 text-[#8e779e]" />
                </button>
              ))}
            </div>
            <div className="mt-auto rounded-2xl border border-[#7a5891]/25 bg-[#2b1d46]/50 p-4 text-right">
              <CircleHelp className="mb-3 h-5 w-5 text-[#edc756]" />
              <p className="text-xs font-bold text-[#ebddb6]">نصيحة اليوم</p>
              <p className="mt-1 text-[11px] leading-5 text-[#b3a3bc]">كل لاعب يحصل على لفّة مجانية واحدة يوميًا.</p>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}

export default PesWheel;

const style = document.createElement("style");
style.textContent = `
  .stadium-lines {
    background:
      radial-gradient(ellipse at 50% 102%, transparent 0 38%, rgba(185, 102, 199, .12) 38.3% 38.7%, transparent 39% 50%, rgba(236, 182, 58, .09) 50.2% 50.5%, transparent 51%),
      repeating-linear-gradient(168deg, transparent 0 42px, rgba(124, 79, 169, .12) 43px 44px, transparent 45px 88px);
    mask-image: linear-gradient(to bottom, transparent 0%, black 30%, black 78%, transparent 100%);
  }
  .welcome-mark { animation: welcome-rise .8s cubic-bezier(.2,.8,.2,1) both; }
  .wheel-spin { transition: transform 3.6s cubic-bezier(.12,.75,.14,1); }
  @keyframes welcome-rise { from { opacity: 0; transform: translateY(18px) scale(.82); } to { opacity: 1; transform: translateY(0) scale(1); } }
  @media (prefers-reduced-motion: reduce) {
    .wheel-spin { transition-duration: .01ms; }
    .welcome-mark { animation: none; }
  }
`;
document.head.appendChild(style);