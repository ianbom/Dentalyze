import { Search } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[#E8E8EC] bg-white/85 px-4 backdrop-blur transition-[width,height] ease-linear md:px-6 dark:border-neutral-800 dark:bg-neutral-950/85">
            <div className="flex min-w-0 items-center gap-3">
                <SidebarTrigger className="-ml-1 size-9 rounded-md text-[#6B6B6B] hover:bg-[#FAFAFA] hover:text-[#0A0A0A] dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-50" />
                <div className="min-w-0 text-sm text-[#6B6B6B] dark:text-neutral-400">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    className="hidden h-9 min-w-64 justify-start rounded-xl border-[#E8E8EC] bg-white px-3 text-sm font-normal text-[#6B6B6B] shadow-none hover:bg-[#FAFAFA] md:flex dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-900"
                    title="Search"
                >
                    <Search className="size-4" />
                    Search
                    <span className="ml-auto rounded border border-[#E8E8EC] px-1.5 py-0.5 font-mono text-[11px] text-[#9C9C9C] dark:border-neutral-800">
                        ⌘K
                    </span>
                </Button>
            </div>
        </header>
    );
}
