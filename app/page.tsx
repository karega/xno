'use client';

import ThreeSceneClientWrapper from '@/components/three-scene-client-wrapper';
import { SlotProvider } from '@/providers/slot-provider';

export default function Page() {
  return (
    <SlotProvider>
      <ThreeSceneClientWrapper />
    </SlotProvider>
  );
}
