import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect
} from 'react';
import { ISolanaSlot } from '@/types/index';
import useSolanaWebsocket from '@/solana/hooks/use-solana-websocket';

interface SlotContextType {
  activeSlots: ISolanaSlot[];
  slotHistory: ISolanaSlot[];
  addSlot: (slot: ISolanaSlot) => void;
}

const SlotContext = createContext<SlotContextType | undefined>(
  undefined
);

export const SlotProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [activeSlots, setActiveSlots] = useState<
    ISolanaSlot[]
  >([]);
  const [slotHistory, setSlotHistory] = useState<
    ISolanaSlot[]
  >([]);
  const { subscriptions } = useSolanaWebsocket();

  const addSlot = useCallback((slot: ISolanaSlot) => {
    setActiveSlots((prev) => [...prev, slot]);
    setSlotHistory((prev) => {
      const newHistory = [slot, ...prev].slice(0, 100); // Keep only the latest 100
      return newHistory;
    });
    setTimeout(() => {
      setActiveSlots((prev) => prev.filter((c) => c !== slot));
    }, Number(500) ?? 0);
  }, []);

  useEffect(() => {
    if (subscriptions) {
      const slotSubscription = subscriptions.slots.subscribe({
        next: (slot) => {
            addSlot(slot);
        },
        error: (err) =>
          console.error('Error in slot subscription:', err.message),
        complete: () => console.log('Slot subscription completed')
      });

      return () => {
        slotSubscription.unsubscribe();
      };
    }
  }, [subscriptions, addSlot]);

  return (
    <SlotContext.Provider
      value={{ activeSlots, slotHistory, addSlot }}
    >
      {children}
    </SlotContext.Provider>
  );
};

export const useSlots = () => {
  const context = useContext(SlotContext);
  if (context === undefined) {
    throw new Error(
      'useSlots must be used within a SlotProvider'
    );
  }
  return context;
};
