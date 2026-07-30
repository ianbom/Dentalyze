import { Head } from '@inertiajs/react';
import PatientForm from '@/pages/patients/_patient-form';
import type { PatientFormPatient } from '@/pages/patients/_patient-form';
import patients from '@/routes/patients';

type PatientsEditProps = {
    patient: PatientFormPatient;
    faskesOptions: { id: number; name: string }[];
};

export default function PatientsEdit({
    faskesOptions,
    patient,
}: PatientsEditProps) {
    return (
        <>
            <Head title={`Edit ${patient.name}`} />
            <PatientForm
                faskesOptions={faskesOptions}
                mode="edit"
                patient={patient}
            />
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
