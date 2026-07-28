import PlaceholderPage from '@/pages/_placeholder-page';
import users from '@/routes/users';

export default function UsersCreate() {
    return (
        <PlaceholderPage title="Tambah User">
            ini halaman tambah user
        </PlaceholderPage>
    );
}

UsersCreate.layout = {
    breadcrumbs: [
        {
            title: 'Users',
            href: users.index(),
        },
        {
            title: 'Tambah User',
            href: users.create(),
        },
    ],
};
