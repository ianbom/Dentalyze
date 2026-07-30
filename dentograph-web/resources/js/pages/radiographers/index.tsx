import StaffDirectory from '@/pages/_staff-directory';
import type { StaffUser } from '@/pages/_staff-directory';
import radiographers from '@/routes/radiographers';

type RadiographersIndexProps = {
    users: StaffUser[];
    faskesOptions: { id: number; name: string }[];
    filters: {
        total: number;
        with_phone: number;
        without_phone: number;
    };
    permissions: {
        create: boolean;
        update: boolean;
        delete: boolean;
    };
};

export default function RadiographersIndex(props: RadiographersIndexProps) {
    return (
        <StaffDirectory
            {...props}
            copy={{
                add: 'Tambah Radiografer',
                empty: 'Belum ada radiografer',
                eyebrow: 'DATA RADIOGRAFER',
                intro: 'Kelola akun radiografer yang menangani proses unggah dan akuisisi radiografi.',
                plural: 'Radiografer',
                roleLabel: 'radiografer',
                title: 'Radiografer',
            }}
            endpoints={{
                destroy: (id) => radiographers.destroy.url(id),
                store: radiographers.store.url(),
                update: (id) => radiographers.update.url(id),
            }}
        />
    );
}

RadiographersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Radiografer',
            href: radiographers.index(),
        },
    ],
};
