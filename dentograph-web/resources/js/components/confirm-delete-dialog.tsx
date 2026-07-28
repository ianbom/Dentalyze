import { Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function ConfirmDeleteDialog({ description, onConfirm, onOpenChange, open, processing = false, title = 'Hapus data?' }: {
    description: string; onConfirm: () => void; onOpenChange: (open: boolean) => void; open: boolean; processing?: boolean; title?: string;
}) {
    return <Dialog onOpenChange={onOpenChange} open={open}>
        <DialogContent className="rounded-[26px] border-white/80 bg-white/90 shadow-[0_30px_80px_rgba(8,120,232,0.2)] backdrop-blur-xl">
            <DialogHeader><div className="mb-3 grid size-12 place-items-center rounded-2xl bg-rose-50 text-rose-500"><Trash2 size={20} /></div><DialogTitle className="text-xl font-black text-[#22304F]">{title}</DialogTitle><DialogDescription className="leading-6 text-[#6f7f99]">{description}</DialogDescription></DialogHeader>
            <DialogFooter><button className="h-11 rounded-[13px] border border-slate-200 px-5 text-sm font-bold text-slate-500" disabled={processing} onClick={() => onOpenChange(false)} type="button">Batal</button><button className="h-11 rounded-[13px] bg-rose-500 px-5 text-sm font-black text-white disabled:opacity-60" disabled={processing} onClick={onConfirm} type="button">{processing ? 'Menghapus…' : 'Ya, Hapus'}</button></DialogFooter>
        </DialogContent>
    </Dialog>;
}
