import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Reward = {
  id: string;
  amount: number;
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
const PRIZE_AMOUNTS = [50, 130, 300, 550, 750, 1040, 2130, 3250, 5700, 12800];

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

  useEffect(() => {
    let mounted = true;

    async function restore() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved && mounted) {
          const parsed = JSON.parse(saved) as {
            balance?: number;
            rewardHistory?: Reward[];
            lastSpinAt?: number | null;
          };
          setBalance(parsed.balance ?? 1250);
          setRewardHistory(parsed.rewardHistory ?? []);
          setLastSpinAt(parsed.lastSpinAt ?? null);
          setSecondsUntilNextSpin(getRemainingSeconds(parsed.lastSpinAt ?? null));
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
    if (!isReady || isSpinning || secondsUntilNextSpin > 0) return null;
    setIsSpinning(true);

    const selectedAmount =
      PRIZE_AMOUNTS[Math.floor(Math.random() * PRIZE_AMOUNTS.length)];
    const reward: Reward = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      amount: selectedAmount,
      createdAt: Date.now(),
    };
    const nextHistory = [reward, ...rewardHistory].slice(0, 20);
    const now = Date.now();

    setBalance((current) => current + selectedAmount);
    setRewardHistory(nextHistory);
    setLastSpinAt(now);
    setSecondsUntilNextSpin(DAY_IN_SECONDS);

    await new Promise((resolve) => setTimeout(resolve, 1150));
    setIsSpinning(false);
    return reward;
  }, [isReady, isSpinning, rewardHistory, secondsUntilNextSpin]);

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