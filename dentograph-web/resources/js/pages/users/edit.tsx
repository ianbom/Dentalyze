import PlaceholderPage from '@/pages/_placeholder-page';
import users from '@/routes/users';

type UsersEditProps = {
    user: string;
};

export default function UsersEdit() {
    return (
        <PlaceholderPage title="Edit User">
            ini halaman edit user
        </PlaceholderPage>
    );
}

UsersEdit.layout = ({ user }: UsersEditProps) => ({
    breadcrumbs: [
        {
            title: 'Users',
            href: users.index(),
        },
        {
            title: 'Edit User',
            href: users.edit(user),
        },
    ],
});
