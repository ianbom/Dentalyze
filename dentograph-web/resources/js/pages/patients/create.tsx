import { Head } from '@inertiajs/react';
import PatientForm from '@/pages/patients/_patient-form';
import patients from '@/routes/patients';

type PatientsCreateProps = {
    faskesOptions: { id: number; name: string }[];
};

export default function PatientsCreate({ faskesOptions }: PatientsCreateProps) {
    return (
        <>
            <Head title="Tambah Pasien" />
            <PatientForm faskesOptions={faskesOptions} mode="create" />
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
