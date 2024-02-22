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
                НЕ ТРОЖЬ
            </Button>
        </>
    )
}

export const Route = createFileRoute('/_dashboard/')({
    component: Index,
})
