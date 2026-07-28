import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-[#6366F1] text-white shadow-none">
                <AppLogoIcon className="size-5 fill-current text-white" />
            </div>
            <div className="ml-1 grid flex-1 text-left">
                <span className="truncate text-sm leading-tight font-semibold tracking-normal text-[#0A0A0A] dark:text-neutral-50">
                    Dentograph AI
                </span>
                <span className="truncate text-xs leading-tight text-[#6B6B6B] group-data-[collapsible=icon]:hidden dark:text-neutral-400">
                    Clinical admin
                </span>
            </div>
        </>
    );
}
