import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout'; // Tetap import untuk properti .layout
import AdminDashboard from './AdminDashboard';
import RadiographerDashboard from './RadiographerDashboard';
import DoctorDashboard from './DoctorDashboard';
import PatientDashboard from './PatientDashboard';

export default function Dashboard(props: any) {
    const { role } = props;

    if (role === 'pasien') {
        return (
            <>
                <Head title="Dashboard" />
                <PatientDashboard {...props} />
            </>
        );
    }

    return (
        <AppLayout>
            <Head title="Dashboard" />
            {role === 'admin' && <AdminDashboard {...props} />}
            {role === 'radiografer' && <RadiographerDashboard {...props} />}
            {role === 'dokter' && <DoctorDashboard {...props} />}
        </AppLayout>
    );
}
