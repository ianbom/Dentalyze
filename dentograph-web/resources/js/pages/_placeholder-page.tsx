import { Head } from '@inertiajs/react';

type PlaceholderPageProps = {
    title: string;
    children: React.ReactNode;
    publicPage?: boolean;
};

export default function PlaceholderPage({
    title,
    children,
    publicPage = false,
}: PlaceholderPageProps) {
    const content = (
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="rounded-lg border border-sidebar-border/70 bg-card p-6 text-card-foreground shadow-sm dark:border-sidebar-border">
                {children}
            </div>
        </div>
    );

    return (
        <>
            <Head title={title} />
            {publicPage ? (
                <div className="min-h-screen bg-background text-foreground">
                    {content}
                </div>
            ) : (
                content
            )}
        </>
    );
}
