import { Navigate, createFileRoute } from '@tanstack/react-router'

export const Redirect = () => {
    const { user_id: userID } = Route.useParams()
    return (
        <Navigate
            to="/users/$user_id/"
            params={{
                user_id: userID,
            }}
            search={{
                view: ['cars'],
            }}
            replace
        />
    )
}

export const Route = createFileRoute('/_dashboard/users/$user_id/edit-car/')({
    component: Redirect,
})
