import { useState, useEffect, useCallback, useMemo } from 'react';
import { Subject, interval } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { ISolanaSlot } from '@/types/index';
import { APP_CONFIG } from '@/constants/config';
import { SampleSolanaData } from '@/data/sample-solana-data';

interface Subscriptions {
  slots: Subject<ISolanaSlot>;
}

const useSolanaWebsocket = () => {
  const wsUrl = useMemo(() => "wss://ws2.x1val.online:6789/", []);
  const [socket, setSocket] = useState<WebSocketSubject<any> | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscriptions | null>(
    null
  );

  const isLocalDevelopment = useMemo(() => {
    return !wsUrl || APP_CONFIG.debug.useSampleData;
  }, [wsUrl]);

  const simulateSlots = useCallback(() => {
    const SimulationInterval = APP_CONFIG.simulation.interval; // ms
    if (isLocalDevelopment) {
      const slotSubscription = new Subject<ISolanaSlot>();
      let index = 0;

      const intervalSubscription = interval(SimulationInterval).subscribe(
        () => {
          const slot = SampleSolanaData[index];
          slotSubscription.next(slot);
          index = (index + 1) % SampleSolanaData.length;
        }
      );

      setSubscriptions({
        slots: slotSubscription,
      });

      return () => {
        intervalSubscription.unsubscribe();
      };
    }
  }, [isLocalDevelopment]);

  const subscribe = useCallback(() => {
    if (socket && !isLocalDevelopment) {
      const slotSubscription = new Subject<ISolanaSlot>();

      socket.asObservable().subscribe((res) => {
        slotSubscription.next(res);
      });

      setSubscriptions({
        slots: slotSubscription,
      });
    }
  }, [socket, isLocalDevelopment]);

  useEffect(() => {
    if (isLocalDevelopment) {
      console.log('Using sample data for local development');
      return simulateSlots();
    } else {
      const newSocket = webSocket<any>({
        url: wsUrl,
        openObserver: {
          next: () => {
            console.log('WebSocket connection established');
          }
        },
        closeObserver: {
          next: (closeEvent) => {
            console.log('WebSocket connection closed:', closeEvent);
          }
        }
      });

      setSocket(newSocket);

      return () => {
        if (newSocket) {
          console.log('Closing WebSocket connection');
          newSocket.complete();
        }
      };
    }
  }, [wsUrl, isLocalDevelopment, simulateSlots]);

  useEffect(() => {
    if (socket && !isLocalDevelopment) {
      subscribe();
    }
  }, [socket, subscribe, isLocalDevelopment]);

  return { subscriptions };
};

export default useSolanaWebsocket;
