"use client"

import { useState, useEffect, useRef } from "react"

interface CustomTimePickerProps {
  value: string
  onChange: (value: string) => void
}

export function CustomTimePicker({ value, onChange }: CustomTimePickerProps) {
  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const isUserChange = useRef(false);

  // Parse time string to get hour, minute, and AM/PM
  const parseTime = (timeStr: string) => {
    if (!timeStr) return { hour: "12", minute: "00", isPM: false };
    
    let [h, m] = timeStr.split(":");
    let hour24 = Number(h);
    let minute = m ? Number(m) : 0;
    let isPM = hour24 >= 12;
    let hour12 = hour24 % 12;
    if (hour12 === 0) hour12 = 12;
    
    return {
      hour: hour12.toString().padStart(2, '0'),
      minute: minute.toString().padStart(2, '0'),
      isPM
    };
  };

  const initialTime = parseTime(value);
  const [selectedHour, setSelectedHour] = useState(initialTime.hour);
  const [selectedMinute, setSelectedMinute] = useState(initialTime.minute);
  const [ampm, setAMPM] = useState(initialTime.isPM ? 'PM' : 'AM');

  // Update state when value prop changes, but only if it's not a user change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!isUserChange.current) {
      const newTime = parseTime(value);
      setSelectedHour(newTime.hour);
      setSelectedMinute(newTime.minute);
      setAMPM(newTime.isPM ? 'PM' : 'AM');
    }
  }, [value]);

  // Update parent when state changes
  useEffect(() => {
    if (isInitialMount.current) return;

    let hour = Number(selectedHour);
    if (ampm === 'PM' && hour !== 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    
    // Ensure hour is within valid range (0-23)
    hour = Math.max(0, Math.min(23, hour));
    
    const newValue = `${hour.toString().padStart(2, '0')}:${selectedMinute}`;
    if (newValue !== value) {
      isUserChange.current = true;
      onChange(newValue);
      // Reset the flag after a short delay to allow for external updates
      setTimeout(() => {
        isUserChange.current = false;
      }, 100);
    }
  }, [selectedHour, selectedMinute, ampm]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>, ref: React.RefObject<HTMLDivElement | null>) => {
    const element = ref.current;
    if (element) {
      e.preventDefault();
      element.scrollTop += e.deltaY;
    }
  };

  const hours = Array.from({ length: 12 }, (_, i) => ((i + 1).toString().padStart(2, '0')));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <div className="flex items-center gap-2 bg-white rounded-lg border border-purple-200 p-2">
      <div className="flex flex-col items-center">
        <div className="text-xs text-purple-600 font-medium mb-1">Hour</div>
        <div 
          ref={hourListRef}
          className="h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent hover:overflow-y-scroll"
          onWheel={(e) => handleWheel(e, hourListRef)}
        >
          {hours.map((hour) => (
            <div
              key={hour}
              className={`px-4 py-1 cursor-pointer text-center ${
                selectedHour === hour
                  ? 'bg-purple-100 text-purple-700 font-medium'
                  : 'hover:bg-purple-50'
              }`}
              onClick={() => setSelectedHour(hour)}
            >
              {hour}
            </div>
          ))}
        </div>
      </div>
      <div className="text-purple-400 font-medium">:</div>
      <div className="flex flex-col items-center">
        <div className="text-xs text-purple-600 font-medium mb-1">Min</div>
        <div 
          ref={minuteListRef}
          className="h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent hover:overflow-y-scroll"
          onWheel={(e) => handleWheel(e, minuteListRef)}
        >
          {minutes.map((minute) => (
            <div
              key={minute}
              className={`px-4 py-1 cursor-pointer text-center ${
                selectedMinute === minute
                  ? 'bg-purple-100 text-purple-700 font-medium'
                  : 'hover:bg-purple-50'
              }`}
              onClick={() => setSelectedMinute(minute)}
            >
              {minute}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-center ml-2">
        <div className="text-xs text-purple-600 font-medium mb-1">AM/PM</div>
        <div className="flex flex-col gap-1">
          <button
            className={`px-3 py-1 rounded ${ampm === 'AM' ? 'bg-purple-200 text-purple-800 font-bold' : 'bg-slate-100 text-slate-500'}`}
            onClick={() => setAMPM('AM')}
            type="button"
          >AM</button>
          <button
            className={`px-3 py-1 rounded ${ampm === 'PM' ? 'bg-purple-200 text-purple-800 font-bold' : 'bg-slate-100 text-slate-500'}`}
            onClick={() => setAMPM('PM')}
            type="button"
          >PM</button>
        </div>
      </div>
    </div>
  );
} 