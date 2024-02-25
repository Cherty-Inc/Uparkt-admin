import { FC, PropsWithChildren } from 'react'
import { clsx } from 'clsx'
import { Card, CardBody } from '@nextui-org/react'

interface Props extends PropsWithChildren {
    color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
    radius?: 'none' | 'sm' | 'md' | 'lg'
}
const Message: FC<Props> = ({ color = 'default', radius = 'md', children }) => {
    return (
        <Card
            className={clsx({
                'bg-default text-default-foreground': color === 'default',
                'bg-primary text-primary-foreground': color === 'primary',
                'bg-secondary text-secondary-foreground': color === 'secondary',
                'bg-success text-success-foreground': color === 'success',
                'bg-warning text-warning-foreground': color === 'warning',
                'bg-danger text-danger-foreground': color === 'danger',
            })}
            radius={radius}
        >
            <CardBody>{children}</CardBody>
        </Card>
    )
}

export default Message
