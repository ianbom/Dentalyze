import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export function NavMain({ items = [] }: { items: NavItem[]; label?: string }) {
    const { isCurrentOrParentUrl, isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-0 py-0">
            <SidebarMenu className="gap-2">
                {items.map((item) => {
                    const isActive =
                        isCurrentUrl(item.href) ||
                        item.children?.some((child) =>
                            isCurrentOrParentUrl(child.href),
                        ) ||
                        false;

                    if (item.children?.length) {
                        return (
                            <Collapsible
                                key={item.title}
                                asChild
                                defaultOpen={isActive}
                                className="group/collapsible"
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton
                                            isActive={isActive}
                                            tooltip={{ children: item.title }}
                                            className="h-11 rounded-2xl px-4 text-[13px] font-semibold text-[#526184] transition-all hover:bg-[#F4FAFF] hover:text-[#1599F5] data-[active=true]:bg-gradient-to-r data-[active=true]:from-[#1599F5] data-[active=true]:to-[#49E1DA] data-[active=true]:text-white data-[active=true]:shadow-lg"
                                        >
                                            {item.icon && <item.icon />}

                                            <span>{item.title}</span>

                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>

                                    <CollapsibleContent>
                                        <SidebarMenuSub className="mt-2 ml-4 space-y-2 border-l border-[#E7EEF8] pl-4">
                                            {item.children.map((child) => (
                                                <SidebarMenuSubItem
                                                    key={child.title}
                                                >
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={isCurrentUrl(
                                                            child.href,
                                                        )}
                                                        className="h-9 rounded-xl px-3 text-[12px] font-medium text-[#7B8BA7] hover:bg-[#F4FAFF] hover:text-[#1599F5] data-[active=true]:bg-[#EAF6FF] data-[active=true]:text-[#1599F5]"
                                                    >
                                                        <Link
                                                            href={child.href}
                                                            prefetch
                                                        >
                                                            {child.icon && (
                                                                <child.icon />
                                                            )}

                                                            <span>
                                                                {child.title}
                                                            </span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        );
                    }

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={isActive}
                                tooltip={{ children: item.title }}
                                className="h-11 rounded-2xl px-4 text-[13px] font-semibold text-[#526184] transition-all hover:bg-[#F4FAFF] hover:text-[#1599F5] data-[active=true]:bg-gradient-to-r data-[active=true]:from-[#1599F5] data-[active=true]:to-[#49E1DA] data-[active=true]:text-white data-[active=true]:shadow-lg"
                            >
                                <Link href={item.href} prefetch>
                                    {item.icon && <item.icon />}

                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}

// export function NavMain({
//     items = [],
//     label = 'Menu',
// }: {
//     items: NavItem[];
//     label?: string;
// }) {
//     const { isCurrentUrl } = useCurrentUrl();

//     return (
//         <SidebarGroup className="px-0 py-0">
//             <SidebarGroupLabel className="h-7 px-3 text-[11px] font-medium tracking-normal text-[#9C9C9C] uppercase dark:text-neutral-500">
//                 {label}
//             </SidebarGroupLabel>
//             <SidebarMenu className="gap-1">
//                 {items.map((item) => {
//                     const isActive =
//                         isCurrentUrl(item.href) ||
//                         item.children?.some((child) =>
//                             isCurrentUrl(child.href),
//                         ) ||
//                         false;

//                     if (item.children?.length) {
//                         return (
//                             <Collapsible
//                                 key={item.title}
//                                 asChild
//                                 defaultOpen={isActive}
//                                 className="group/collapsible"
//                             >
//                                 <SidebarMenuItem>
//                                     <CollapsibleTrigger asChild>
//                                         <SidebarMenuButton
//                                             isActive={isActive}
//                                             tooltip={{ children: item.title }}
//                                             className="h-9 rounded-md px-3 text-[14px] font-medium text-[#6B6B6B] transition hover:-translate-y-px hover:bg-[#FAFAFA] hover:text-[#0A0A0A] data-[active=true]:bg-indigo-50 data-[active=true]:text-[#6366F1] data-[active=true]:shadow-none dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-50 dark:data-[active=true]:bg-indigo-500/10 dark:data-[active=true]:text-indigo-300"
//                                         >
//                                             {item.icon && <item.icon />}
//                                             <span>{item.title}</span>
//                                             <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
//                                         </SidebarMenuButton>
//                                     </CollapsibleTrigger>
//                                     <CollapsibleContent>
//                                         <SidebarMenuSub className="mx-4 my-1 border-[#E8E8EC] px-2 dark:border-neutral-800">
//                                             {item.children.map((child) => (
//                                                 <SidebarMenuSubItem
//                                                     key={child.title}
//                                                 >
//                                                     <SidebarMenuSubButton
//                                                         asChild
//                                                         isActive={isCurrentUrl(
//                                                             child.href,
//                                                         )}
//                                                         className="h-8 rounded-md px-2 text-[13px] text-[#6B6B6B] hover:bg-[#FAFAFA] hover:text-[#0A0A0A] data-[active=true]:bg-indigo-50 data-[active=true]:text-[#6366F1] dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-50 dark:data-[active=true]:bg-indigo-500/10 dark:data-[active=true]:text-indigo-300"
//                                                     >
//                                                         <Link
//                                                             href={child.href}
//                                                             prefetch
//                                                         >
//                                                             {child.icon && (
//                                                                 <child.icon />
//                                                             )}
//                                                             <span>
//                                                                 {child.title}
//                                                             </span>
//                                                         </Link>
//                                                     </SidebarMenuSubButton>
//                                                 </SidebarMenuSubItem>
//                                             ))}
//                                         </SidebarMenuSub>
//                                     </CollapsibleContent>
//                                 </SidebarMenuItem>
//                             </Collapsible>
//                         );
//                     }

//                     return (
//                         <SidebarMenuItem key={item.title}>
//                             <SidebarMenuButton
//                                 asChild
//                                 isActive={isActive}
//                                 tooltip={{ children: item.title }}
//                                 className="h-9 rounded-md px-3 text-[14px] font-medium text-[#6B6B6B] transition hover:-translate-y-px hover:bg-[#FAFAFA] hover:text-[#0A0A0A] data-[active=true]:bg-indigo-50 data-[active=true]:text-[#6366F1] data-[active=true]:shadow-none dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-50 dark:data-[active=true]:bg-indigo-500/10 dark:data-[active=true]:text-indigo-300"
//                             >
//                                 <Link href={item.href} prefetch>
//                                     {item.icon && <item.icon />}
//                                     <span>{item.title}</span>
//                                 </Link>
//                             </SidebarMenuButton>
//                         </SidebarMenuItem>
//                     );
//                 })}
//             </SidebarMenu>
//         </SidebarGroup>
//     );
// }
