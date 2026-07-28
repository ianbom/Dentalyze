import PlaceholderPage from '@/pages/_placeholder-page';
import radiographs from '@/routes/radiographs';

type RadiographsShowProps = {
    radiograph: string;
};

export default function RadiographsShow() {
    return (
        <PlaceholderPage title="Detail Deteksi">
            ini halaman detail deteksi
        </PlaceholderPage>
    );
}

RadiographsShow.layout = ({ radiograph }: RadiographsShowProps) => ({
    breadcrumbs: [
        {
            title: 'Radiographs',
            href: radiographs.index(),
        },
        {
            title: 'Detail Deteksi',
            href: radiographs.show(radiograph),
        },
    ],
});
