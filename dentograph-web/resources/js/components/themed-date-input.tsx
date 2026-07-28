import { CalendarDays } from 'lucide-react';
import type { ComponentProps } from 'react';

export default function ThemedDateInput(props: ComponentProps<'input'>) {
    return <div className="relative">
        <input {...props} className={`${props.className ?? ''} scheme-light pr-12 [color-scheme:light]`} type="date" />
        <CalendarDays aria-hidden className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-[#1599F5]" size={18} />
    </div>;
}
