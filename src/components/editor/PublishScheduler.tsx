
import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  CalendarClock, 
  CalendarIcon, 
  Clock, 
  Calendar as CalendarLucide,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

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
  const [selectedHour, setSelectedHour] = useState<string>("23");
  const [selectedMinute, setSelectedMinute] = useState<string>("59");

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      // Set time to end of day so the post remains unpublished until then
      const dateWithTime = new Date(selectedDate);
      dateWithTime.setHours(parseInt(selectedHour, 10), parseInt(selectedMinute, 10), 0, 0);
      onSchedule(dateWithTime.toISOString());
    } else {
      onSchedule(undefined);
      setIsOpen(false);
    }
  };

  const handleTimeChange = () => {
    if (date) {
      const dateWithTime = new Date(date);
      dateWithTime.setHours(parseInt(selectedHour, 10), parseInt(selectedMinute, 10), 0, 0);
      onSchedule(dateWithTime.toISOString());
      
      // Show toast confirmation
      const formattedDate = format(dateWithTime, "PPP");
      const formattedTime = format(dateWithTime, "p");
      toast.success(`Post scheduled for ${formattedDate} at ${formattedTime}`);
      
      setIsOpen(false);
    }
  };

  const formatScheduleDate = () => {
    if (!date) return "Schedule publication";
    
    const scheduleDate = new Date(date);
    const now = new Date();
    const isToday = scheduleDate.toDateString() === now.toDateString();
    const isTomorrow = new Date(now.setDate(now.getDate() + 1)).toDateString() === scheduleDate.toDateString();
    
    const time = format(scheduleDate, "p"); // Format time as "7:00 PM"
    
    if (isToday) return `Today at ${time}`;
    if (isTomorrow) return `Tomorrow at ${time}`;
    return format(scheduleDate, "MMM d") + ` at ${time}`;
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
              !date && "text-muted-foreground",
              date && "text-primary bg-primary/10"
            )}
            disabled={isPublished}
          >
            {date ? <CalendarClock className="h-4 w-4" /> : <CalendarIcon className="h-4 w-4" />}
            {date ? formatScheduleDate() : "Schedule publication"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 border-b">
            <div className="text-sm font-medium mb-2">Schedule Publication</div>
            <div className="text-xs text-muted-foreground">
              Select when this post should be published.
            </div>
          </div>
          
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
            disabled={(date) => date < new Date()}
            className="pointer-events-auto"
          />
          
          {date && (
            <div className="p-3 border-t">
              <div className="text-sm font-medium mb-2">Publication Time</div>
              <div className="flex items-center gap-2">
                <Select
                  value={selectedHour}
                  onValueChange={setSelectedHour}
                >
                  <SelectTrigger className="w-[70px]">
                    <SelectValue placeholder="Hour" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }).map((_, i) => (
                      <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                        {i.toString().padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span>:</span>
                <Select
                  value={selectedMinute}
                  onValueChange={setSelectedMinute}
                >
                  <SelectTrigger className="w-[70px]">
                    <SelectValue placeholder="Min" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 60 }).map((_, i) => (
                      <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                        {i.toString().padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button size="sm" onClick={handleTimeChange}>
                  Set Time
                </Button>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {date && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => handleDateSelect(undefined)}
          disabled={isPublished}
          className="h-9 px-2"
        >
          <X size={14} className="mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
};
