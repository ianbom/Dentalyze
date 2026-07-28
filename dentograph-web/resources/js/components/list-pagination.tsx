import { ChevronLeft, ChevronRight } from 'lucide-react';

type ListPaginationProps = {
    page: number;
    pageSize: number;
    pageSizeOptions?: number[];
    setPage: (page: number) => void;
    setPageSize: (pageSize: number) => void;
    total: number;
};

export function getPageItems<T>(items: T[], page: number, pageSize: number) {
    const start = (page - 1) * pageSize;

    return items.slice(start, start + pageSize);
}

export function getTotalPages(total: number, pageSize: number) {
    return Math.max(1, Math.ceil(total / pageSize));
}

export default function ListPagination({
    page,
    pageSize,
    pageSizeOptions = [5, 10, 15, 25],
    setPage,
    setPageSize,
    total,
}: ListPaginationProps) {
    const totalPages = getTotalPages(total, pageSize);
    const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);

    return (
        <div className="flex flex-col gap-3 border-t border-white/60 px-5 py-4 text-sm text-[#7B8BA7] md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
                <span className="text-xs font-semibold">Tampilkan</span>
                <select
                    className="h-10 rounded-[13px] border border-white/70 bg-white/45 px-3 text-xs font-black text-[#22304F] shadow-[0_12px_28px_rgba(19,184,255,0.10)] backdrop-blur-md transition outline-none focus:border-[#13b8ff] focus:bg-white/65"
                    onChange={(event) => {
                        setPageSize(Number(event.target.value));
                        setPage(1);
                    }}
                    value={pageSize}
                >
                    {pageSizeOptions.map((option) => (
                        <option key={option} value={option}>
                            {option} row
                        </option>
                    ))}
                </select>
                <span className="text-xs font-semibold">
                    {start}-{end} dari {total}
                </span>
            </div>

            <div className="flex items-center gap-2">
                <button
                    className="grid size-10 place-items-center rounded-[13px] border border-sky-100/80 bg-sky-50/75 text-[#1599F5] shadow-[0_12px_28px_rgba(14,165,233,0.12)] backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-sky-100/80 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={page <= 1}
                    onClick={() => setPage(Math.max(1, page - 1))}
                    type="button"
                >
                    <ChevronLeft size={17} />
                </button>

                <span className="min-w-24 rounded-[13px] border border-white/70 bg-white/45 px-4 py-2 text-center text-xs font-black text-[#22304F] shadow-[0_12px_28px_rgba(19,184,255,0.10)] backdrop-blur-md">
                    {page} / {totalPages}
                </span>

                <button
                    className="grid size-10 place-items-center rounded-[13px] border border-sky-100/80 bg-sky-50/75 text-[#1599F5] shadow-[0_12px_28px_rgba(14,165,233,0.12)] backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-sky-100/80 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={page >= totalPages}
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    type="button"
                >
                    <ChevronRight size={17} />
                </button>
            </div>
        </div>
    );
}
