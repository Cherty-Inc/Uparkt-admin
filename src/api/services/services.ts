import { z } from 'zod'
import { publicAxios } from '../axios'

const AllServicesScheme = z
    .object({
        id: z.number(),
        title: z.string(),
        services: z
            .object({
                id: z.number(),
                title: z.string(),
                id_category: z.number(),
                isActive: z.boolean(),
            })
            .array(),
    })
    .array()

export const getAllServices = async () => {
    const scheme = z.object({
        services: AllServicesScheme,
    })
    const response = await publicAxios.get('/api/v1.0/static_data/service')

    const data = scheme.parse(response.data)
    return data.services
}
