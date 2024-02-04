import { useEffect, useState } from 'react'

export const useFavicon = () => {
    const [src, setSrc] = useState<string>()

    useEffect(() => {
        const el = document.querySelector("link[rel~='icon']")
        if (el) {
            setSrc(el.getAttribute('href') || undefined)
        }
    }, [])

    useEffect(() => {
        const el = document.querySelector("link[rel~='icon']")
        if (!el) {
            console.warn("favicon link element doesn't exists in DOM")
            return
        }
        if (src) {
            el.setAttribute('href', src)
        }
    }, [src])

    return { favicon: src, setFavicon: setSrc }
}

export const useMetaThemeColor = (
    color: string,
    options: {
        revertOnUnmount?: boolean
    } = { revertOnUnmount: true },
) => {
    const [meta, setMeta] = useState<HTMLMetaElement>()
    const [previousColor, setPreviousColor] = useState('')

    useEffect(() => {
        const metaTag = document.head.querySelector('meta[name="theme-color"]') as HTMLMetaElement

        if (metaTag) {
            setMeta(metaTag)
            setPreviousColor(metaTag.getAttribute('content')!)
        } else {
            const newMeta = document.createElement('meta')
            newMeta.setAttribute('name', 'theme-color')

            document.head.appendChild(newMeta)

            setMeta(newMeta)
        }
    }, [])

    const revert = () => {
        if (!meta) {
            return
        }

        meta.setAttribute('content', previousColor)
    }

    useEffect(() => {
        if (!meta) {
            return
        }

        meta.setAttribute('content', color)

        return options.revertOnUnmount ? revert : undefined
    }, [meta, color])
}
