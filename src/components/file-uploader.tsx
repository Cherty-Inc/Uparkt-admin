import { Card } from '@nextui-org/react'
import { FC } from 'react'
import { useDropzone, DropzoneOptions } from 'react-dropzone'

export type FileUploaderOnDrop = Exclude<DropzoneOptions['onDrop'], null | undefined>

type Props = Pick<DropzoneOptions, 'onDrop'>
const FileUploader: FC<Props> = ({ onDrop }) => {
    const { open } = useDropzone({
        onDrop,
    })

    return (
        <>
            <Card
                className="flex h-full w-full items-center justify-center border-4 border-dashed border-foreground border-opacity-20 p-4 text-center !outline-none !transition-all data-[focus-visible]:border-primary-400 data-[focus-visible]:border-opacity-100"
                isPressable
                shadow="none"
                onPress={open}
            >
                Нажмите, чтобы загрузить
            </Card>
        </>
    )
}

export default FileUploader
