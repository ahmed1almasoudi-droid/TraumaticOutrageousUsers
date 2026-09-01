import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type Reward = {
  id: string;
  amount: number;
  label: string;
  outcomeId: string;
  createdAt: number;
};

export type Mission = {
  id: string;
  title: string;
  caption: string;
  progress: number;
  goal: number;
  reward: number;
  completed: boolean;
};

type PesWheelContextValue = {
  balance: number;
  rewardHistory: Reward[];
  lastSpinAt: number | null;
  isReady: boolean;
  isSpinning: boolean;
  spin: () => Promise<Reward | null>;
  secondsUntilNextSpin: number;
  missions: Mission[];
};

const STORAGE_KEY = 'pes-wheel-local-state-v1';
const DAY_IN_SECONDS = 24 * 60 * 60;
export const WHEEL_OUTCOMES = [
  { id: 'luck-better', label: 'حظ أوفر', amount: 0, probability: 100 },
  { id: 'coins-130', label: '130', amount: 130, probability: 0 },
  { id: 'coins-300', label: '300', amount: 300, probability: 0 },
  { id: 'coins-550', label: '550', amount: 550, probability: 0 },
  { id: 'coins-750', label: '750', amount: 750, probability: 0 },
  { id: 'coins-1040', label: '1040', amount: 1040, probability: 0 },
  { id: 'coins-2130', label: '2130', amount: 2130, probability: 0 },
  { id: 'coins-3250', label: '3250', amount: 3250, probability: 0 },
  { id: 'coins-5700', label: '5700', amount: 5700, probability: 0 },
  { id: 'coins-12800', label: '12800', amount: 12800, probability: 0 },
] as const;

const initialMissions: Mission[] = [
  {
    id: 'first-spin',
    title: 'اللفة الأولى',
    caption: 'لفّ العجلة مرة واحدة',
    progress: 0,
    goal: 1,
    reward: 100,
    completed: false,
  },
  {
    id: 'daily-return',
    title: 'لاعب منتظم',
    caption: 'ارجع غداً وحافظ على سلسلتك',
    progress: 0,
    goal: 3,
    reward: 500,
    completed: false,
  },
];

function getRemainingSeconds(lastSpinAt: number | null): number {
  if (!lastSpinAt) return 0;
  return Math.max(
    0,
    DAY_IN_SECONDS - Math.floor((Date.now() - lastSpinAt) / 1000),
  );
}

export function PesWheelProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(1250);
  const [rewardHistory, setRewardHistory] = useState<Reward[]>([]);
  const [lastSpinAt, setLastSpinAt] = useState<number | null>(null);
  const [secondsUntilNextSpin, setSecondsUntilNextSpin] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const lastSpinAtRef = useRef<number | null>(null);
  const spinLockRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    async function restore() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved && mounted) {
          const parsed = JSON.parse(saved) as {
            balance?: number;
            rewardHistory?: Array<Partial<Reward>>;
            lastSpinAt?: number | null;
          };
          setBalance(parsed.balance ?? 1250);
          setRewardHistory(
            (parsed.rewardHistory ?? []).map((reward, index) => ({
              id: reward.id ?? `legacy-${index}`,
              amount: reward.amount ?? 0,
              label:
                reward.label ??
                (reward.amount && reward.amount > 0
                  ? String(reward.amount)
                  : 'حظ أوفر'),
              outcomeId:
                reward.outcomeId ??
                (reward.amount && reward.amount > 0
                  ? 'legacy-coins'
                  : 'luck-better'),
              createdAt: reward.createdAt ?? Date.now(),
            })),
          );
          const restoredLastSpinAt = parsed.lastSpinAt ?? null;
          lastSpinAtRef.current = restoredLastSpinAt;
          setLastSpinAt(restoredLastSpinAt);
          setSecondsUntilNextSpin(getRemainingSeconds(restoredLastSpinAt));
        }
      } catch {
        // A fresh local session is a safe fallback for a corrupted preview cache.
      } finally {
        if (mounted) setIsReady(true);
      }
    }

    void restore();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isReady) return;
    const timer = setInterval(() => {
      setSecondsUntilNextSpin(getRemainingSeconds(lastSpinAt));
    }, 1000);
    return () => clearInterval(timer);
  }, [isReady, lastSpinAt]);

  useEffect(() => {
    if (!isReady) return;
    void AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ balance, rewardHistory, lastSpinAt }),
    );
  }, [balance, isReady, lastSpinAt, rewardHistory]);

  const spin = useCallback(async () => {
    if (
      !isReady ||
      spinLockRef.current ||
      getRemainingSeconds(lastSpinAtRef.current) > 0
    ) {
      return null;
    }
    spinLockRef.current = true;
    setIsSpinning(true);

    // Preview configuration: luck-better owns 100% of the probability budget.
    // Keep this explicit so changing the demo odds later is deliberate.
    const selectedOutcome = WHEEL_OUTCOMES.find(
      (outcome) => outcome.probability === 100,
    ) ?? WHEEL_OUTCOMES[0];
    const reward: Reward = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      label: selectedOutcome.label,
      outcomeId: selectedOutcome.id,
      amount: selectedOutcome.amount,
      createdAt: Date.now(),
    };
    const nextHistory = [reward, ...rewardHistory].slice(0, 20);
    const now = Date.now();

    lastSpinAtRef.current = now;
    if (selectedOutcome.amount > 0) {
      setBalance((current) => current + selectedOutcome.amount);
    }
    setRewardHistory(nextHistory);
    setLastSpinAt(now);
    setSecondsUntilNextSpin(DAY_IN_SECONDS);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1150));
      return reward;
    } finally {
      spinLockRef.current = false;
      setIsSpinning(false);
    }
  }, [isReady, rewardHistory]);

  const missions = useMemo(() => {
    const firstSpinProgress = rewardHistory.length > 0 ? 1 : 0;
    return initialMissions.map((mission) =>
      mission.id === 'first-spin'
        ? {
            ...mission,
            progress: firstSpinProgress,
            completed: firstSpinProgress >= mission.goal,
          }
        : mission,
    );
  }, [rewardHistory.length]);

  const value = useMemo(
    () => ({
      balance,
      rewardHistory,
      lastSpinAt,
      isReady,
      isSpinning,
      spin,
      secondsUntilNextSpin,
      missions,
    }),
    [
      balance,
      isReady,
      isSpinning,
      lastSpinAt,
      missions,
      rewardHistory,
      secondsUntilNextSpin,
      spin,
    ],
  );

  return (
    <PesWheelContext.Provider value={value}>
      {children}
    </PesWheelContext.Provider>
  );
}

const PesWheelContext = createContext<PesWheelContextValue | null>(null);

export function usePesWheel() {
  const context = useContext(PesWheelContext);
  if (!context) {
    throw new Error('usePesWheel must be used inside PesWheelProvider');
  }
  return context;
}