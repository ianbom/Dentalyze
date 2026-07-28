import { Head } from '@inertiajs/react';
import PatientForm from '@/pages/patients/_patient-form';
import type { PatientFormPatient } from '@/pages/patients/_patient-form';
import patients from '@/routes/patients';

type PatientsEditProps = {
    patient: PatientFormPatient;
};

export default function PatientsEdit({ patient }: PatientsEditProps) {
    return (
        <>
            <Head title={`Edit ${patient.name}`} />
            <PatientForm mode="edit" patient={patient} />
        </>
    );
}

PatientsEdit.layout = ({ patient }: PatientsEditProps) => ({
    breadcrumbs: [
        {
            title: 'Pasien',
            href: patients.index(),
        },
        {
            title: 'Edit Pasien',
            href: patients.edit(patient.nik),
        },
    ],
});
