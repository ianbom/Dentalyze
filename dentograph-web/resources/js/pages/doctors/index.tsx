import StaffDirectory from '@/pages/_staff-directory';
import type { StaffUser } from '@/pages/_staff-directory';
import doctors from '@/routes/doctors';

type DoctorsIndexProps = {
    users: StaffUser[];
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

export default function DoctorsIndex(props: DoctorsIndexProps) {
    return (
        <StaffDirectory
            {...props}
            copy={{
                add: 'Tambah Dokter',
                empty: 'Belum ada dokter',
                eyebrow: 'DATA DOKTER',
                intro: 'Kelola akun dokter yang membaca hasil pemeriksaan dan melakukan verifikasi klinis.',
                plural: 'Dokter',
                roleLabel: 'dokter',
                title: 'Dokter',
            }}
            endpoints={{
                destroy: (id) => doctors.destroy.url(id),
                store: doctors.store.url(),
                update: (id) => doctors.update.url(id),
            }}
        />
    );
}

DoctorsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dokter',
            href: doctors.index(),
        },
    ],
};
