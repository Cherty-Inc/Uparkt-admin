import { ImageProps, Image, Modal, ModalContent } from '@nextui-org/react'
import { FC, useState } from 'react'

interface Props extends Pick<ImageProps, 'src' | 'srcSet'> {
    previewProps?: Omit<ImageProps, 'src' | 'srcSet' | 'onClick'>
    viewProps?: Omit<ImageProps, 'src' | 'srcSet' | 'onClick'>
}

const ImageWithModal: FC<Props> = ({ previewProps = {}, viewProps = {}, src, srcSet }) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <Image {...previewProps} src={src} srcSet={srcSet} onClick={() => setIsOpen(true)} />
            <Modal scrollBehavior="outside" isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <ModalContent>
                    {() => (
                        <Image
                            {...viewProps}
                            onClick={() => setIsOpen(false)}
                            className="h-full w-full object-contain"
                            src={src}
                            srcSet={srcSet}
                        />
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}

export default ImageWithModal
