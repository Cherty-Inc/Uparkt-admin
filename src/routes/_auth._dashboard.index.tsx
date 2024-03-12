import { createFileRoute } from '@tanstack/react-router'
import { type FC } from 'react'

const Index: FC = () => {
    return (
        <>
            <div>HOME</div>
        </>
    )
}

export const Route = createFileRoute('/_auth/_dashboard/')({
    component: Index,
    beforeLoad: () => ({
        title: '',
    }),
})
