'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSlots } from '@/providers/slot-provider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { truncateAddress } from '@/lib/truncate-address';
import { formatRelativeTime } from '@/lib/format-relative-time';
import { ISolanaSlot } from '@/types/index';
import { Maximize2, Minimize2, ChevronDown, ChevronUp } from 'lucide-react';

interface SlotHistoryTableProps {}

export const SlotHistoryTable: React.FC<
  SlotHistoryTableProps
> = () => {
  const { slotHistory } = useSlots();
  const [isFullView, setIsFullView] = useState(true);
  const [limitedHistory, setLimitedHistory] = useState<ISolanaSlot[]>([]);
  const [showLessRows, setShowLessRows] = useState(true);

  const displayedSlots = useMemo(() => {
    if (showLessRows && window.innerWidth < 768) {
      return slotHistory.slice(0, 3);
    }
    return slotHistory;
  }, [slotHistory, showLessRows]);

  useEffect(() => {
    setLimitedHistory(displayedSlots.slice(0, 100));
  }, [displayedSlots]);

  const toggleView = () => {
    setIsFullView(!isFullView);
  };

  const toggleRowCount = () => {
    setShowLessRows(!showLessRows);
  };

  return (
    <div className="space-y-4 w-full md:w-auto pointer-events-none select-none">
      <div className="flex justify-end items-center gap-2 pointer-events-auto">
        <Button
          onClick={toggleRowCount}
          variant="outline"
          size="sm"
          className="flex select-none items-center gap-2 bg-transparent hover:bg-transparent hover:text-[#209ce9] md:hidden"
        >
          {showLessRows ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
          <span className="hidden md:inline">
            {showLessRows ? 'Show More' : 'Show Less'}
          </span>
        </Button>
        <Button
          onClick={toggleView}
          variant="outline"
          size="sm"
          className="flex select-none items-center gap-2 bg-transparent hover:bg-transparent hover:text-[#209ce9]"
        >
          {isFullView ? (
            <>
              <Minimize2 className="w-4 h-4" />
              <span className="hidden md:inline">Min View</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-4 h-4" />
              <span className="hidden md:inline">Full View</span>
            </>
          )}
        </Button>
      </div>
      <div className="overflow-hidden max-h-[75vh] md:max-w-[700px] lg:max-w-[800px] md:ml-auto justify-end flex">
        <table className="w-fit bg-transparent border border-transparent text-[14px]">
          <thead className="bg-transparent select-none text-gray-300">
            <tr>
              {isFullView && (
                <>
                  <th className="p-1 md:p-2 text-left">Slot</th>
                  {window.innerWidth >= 768 && (
                    <>
                      <th className="p-1 md:p-2 text-left">Leader</th>
                    </>
                  )}
                </>
              )}
              <th className="p-1 md:p-2 text-left">Time</th>
            </tr>
          </thead>
          <tbody>
            {limitedHistory.map(
              (slot: ISolanaSlot, index: number) => {
                return (
                  <tr
                    key={`${slot.current_slot}-${index}`}
                  >
                    {isFullView && (
                      <>
                        <td className="p-1 md:p-2 text-gray-400">
                          {slot.current_slot}
                        </td>
                        {window.innerWidth >= 768 && (
                          <>
                            <td className="p-1 md:p-2">
                              <TooltipProvider
                                skipDelayDuration={100}
                                delayDuration={0}
                                disableHoverableContent={false}
                              >
                                <Tooltip>
                                  <TooltipTrigger>
                                    <span className="cursor-help text-gray-400">
                                      {truncateAddress(
                                        slot.current_leader
                                      )}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-black">
                                    <span className="bg-black text-white border-1 border-gray-300 p-2 select-text">
                                      {slot.current_leader}
                                    </span>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </td>
                          </>
                        )}
                      </>
                    )}
                    <td className={`p-1 md:p-2 ${isFullView ? '' : 'w-full'}`}>
                      <span>{slot.current_slot_time}</span>
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SlotHistoryTable;
