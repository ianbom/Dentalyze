import PlaceholderPage from '@/pages/_placeholder-page';
import users from '@/routes/users';

export default function UsersIndex() {
    return (
        <PlaceholderPage title="Users">ini halaman daftar dokter</PlaceholderPage>
    );
}

UsersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Users',
            href: users.index(),
        },
    ],
};
