import PlaceholderPage from '@/pages/_placeholder-page';
import users from '@/routes/users';

type UsersShowProps = {
    user: string;
};

export default function UsersShow() {
    return (
        <PlaceholderPage title="Detail User">
            ini halaman detail user
        </PlaceholderPage>
    );
}

UsersShow.layout = ({ user }: UsersShowProps) => ({
    breadcrumbs: [
        {
            title: 'Users',
            href: users.index(),
        },
        {
            title: 'Detail User',
            href: users.show(user),
        },
    ],
});
