import PlaceholderPage from '@/pages/_placeholder-page';
import radiographs from '@/routes/radiographs';

export default function RadiographsCreate() {
    return (
        <PlaceholderPage title="Tambah Deteksi">
            ini halaman tambah deteksi
        </PlaceholderPage>
    );
}

RadiographsCreate.layout = {
    breadcrumbs: [
        {
            title: 'Radiographs',
            href: radiographs.index(),
        },
        {
            title: 'Tambah Deteksi',
            href: radiographs.create(),
        },
    ],
};
