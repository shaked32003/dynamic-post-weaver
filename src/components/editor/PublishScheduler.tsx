
import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Clock, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PublishSchedulerProps {
  publishDate?: string;
  isPublished?: boolean;
  onSchedule: (date: string | undefined) => void;
}

export const PublishScheduler: React.FC<PublishSchedulerProps> = ({
  publishDate,
  isPublished,
  onSchedule,
}) => {
  const [date, setDate] = useState<Date | undefined>(
    publishDate ? new Date(publishDate) : undefined
  );
  const [isOpen, setIsOpen] = useState(false);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      // Set time to end of day so the post remains unpublished until then
      const dateWithTime = new Date(selectedDate);
      dateWithTime.setHours(23, 59, 59, 999);
      onSchedule(dateWithTime.toISOString());
    } else {
      onSchedule(undefined);
    }
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "flex items-center gap-2 text-sm h-9 px-4 py-2",
              !date && "text-muted-foreground"
            )}
            disabled={isPublished}
          >
            {date ? <Clock className="h-4 w-4" /> : <CalendarIcon className="h-4 w-4" />}
            {date
              ? format(date, "PPP")
              : "Schedule publication"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
            disabled={(date) => date < new Date()}
          />
        </PopoverContent>
      </Popover>

      {date && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => handleDateSelect(undefined)}
          disabled={isPublished}
        >
          Clear
        </Button>
      )}
    </div>
  );
};
