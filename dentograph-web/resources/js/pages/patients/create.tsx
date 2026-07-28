import { Head } from '@inertiajs/react';
import PatientForm from '@/pages/patients/_patient-form';
import patients from '@/routes/patients';

export default function PatientsCreate() {
    return (
        <>
            <Head title="Tambah Pasien" />
            <PatientForm mode="create" />
        </>
    );
}

PatientsCreate.layout = {
    breadcrumbs: [
        {
            title: 'Pasien',
            href: patients.index(),
        },
        {
            title: 'Tambah Pasien',
            href: patients.create(),
        },
    ],
};
