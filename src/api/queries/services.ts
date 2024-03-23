import { createQueryKeys } from '@lukemorales/query-key-factory'

import * as servicesService from '@api/services/services'

export const services = createQueryKeys('services', {
    list: {
        queryKey: null,
        queryFn: () => servicesService.getAllServices(),
    },
})
