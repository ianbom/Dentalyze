import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    BrainCircuit,
    Building2,
    ClipboardCheck,
    FileText,
    LayoutGrid,
    Plus,
    ShieldCheck,
    UserCog,
    UserPlus,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import faskes from '@/routes/faskes/index';
import knowledge from '@/routes/knowledge';
import patients from '@/routes/patients';
import radiographs from '@/routes/radiographs';
import users from '@/routes/users';
import verification from '@/routes/verification';
import type { NavItem } from '@/types';

type RoleNavItem = NavItem & {
    roles?: string[];
};

const mainNavItems: RoleNavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Users',
        href: users.index(),
        icon: UserCog,
        children: [
            {
                title: 'Daftar Users',
                href: users.index(),
                icon: Users,
            },
            {
                title: 'Tambah User',
                href: users.create(),
                icon: UserPlus,
            },
        ],
    },
    {
        title: 'Faskes',
        href: faskes.index(),
        icon: Building2,
        roles: ['admin'],
    },
    {
        title: 'Pasien',
        href: patients.index(),
        icon: Users,
        children: [
            {
                title: 'Daftar Pasien',
                href: patients.index(),
                icon: Users,
            },
            {
                title: 'Tambah Pasien',
                href: patients.create(),
                icon: Plus,
            },
        ],
    },
    {
        title: 'Radiographs',
        href: radiographs.index(),
        icon: Activity,
        children: [
            {
                title: 'Daftar Radiograph',
                href: radiographs.index(),
                icon: Activity,
            },
            {
                title: 'Tambah Deteksi',
                href: radiographs.create(),
                icon: Plus,
            },
        ],
    },
    {
        title: 'Knowledge Base',
        href: knowledge.index(),
        icon: BrainCircuit,
        children: [
            {
                title: 'Daftar Knowledge',
                href: knowledge.index(),
                icon: FileText,
            },
            {
                title: 'Create Knowledge',
                href: knowledge.create(),
                icon: Plus,
            },
        ],
    },
    {
        title: 'Tugas Verifikasi',
        href: verification.tasks(),
        icon: ShieldCheck,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Tugas Verifikasi',
        href: verification.tasks(),
        icon: ClipboardCheck,
    },
    {
        title: 'System Status',
        href: dashboard(),
        icon: Activity,
    },
];

export function AppSidebar() {
    const role = (usePage().props as { auth?: { user?: { role?: string } } })
        .auth?.user?.role;
    const roleItems = mainNavItems.filter(
        (item) => !item.roles || (role && item.roles.includes(role)),
    );
    const visibleItems =
        role === 'dokter'
            ? roleItems.filter(
                  (item) =>
                      item.title !== 'Radiographs' &&
                      item.title !== 'Users' &&
                      item.title !== 'Knowledge Base',
              )
            : roleItems;

    return (
        <Sidebar
            collapsible="icon"
            variant="sidebar"
            className="border-r border-[#E8E8EC] bg-white dark:border-neutral-800 dark:bg-neutral-950"
        >
            <SidebarHeader className="border-b border-[#E8E8EC] px-3 py-3 dark:border-neutral-800">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="h-11 rounded-md px-2 hover:bg-[#FAFAFA] data-[active=true]:bg-[#FAFAFA] dark:hover:bg-neutral-900"
                        >
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="gap-4 px-2 py-4">
                <NavMain items={visibleItems} />
            </SidebarContent>

            <SidebarFooter className="border-t border-[#E8E8EC] px-2 py-3 dark:border-neutral-800">
                <NavMain items={footerNavItems} label="Workspace" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
