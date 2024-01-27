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
