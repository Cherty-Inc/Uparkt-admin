import { Button } from '@nextui-org/react'
import { createFileRoute } from '@tanstack/react-router'
import { type FC } from 'react'

const Index: FC = () => {
    const onClick = () => {
        throw new Error('ТИПО КАПЕЦ')
    }

    return (
        <>
            <div>HOME</div>
            <Button color="danger" variant="shadow" size="lg" onClick={onClick}>
                НЕ ТРОЖЬ БОБЭР
            </Button>
        </>
    )
}

export const Route = createFileRoute('/_auth/_dashboard/')({
    component: Index,
    beforeLoad: () => ({
        title: '',
    }),
})
