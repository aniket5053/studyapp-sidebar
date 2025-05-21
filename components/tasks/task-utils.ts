import { parseISO, format } from "date-fns"

export function format12HourTime(dateString: string | undefined): string {
  if (!dateString) return '';
  const date = parseISO(dateString);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

export function capitalizeWords(str: string) {
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '';
  const date = parseISO(dateString);
  return format(date, 'MMM d, yyyy');
} 