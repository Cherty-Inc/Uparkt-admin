import { createQueryKeys } from '@lukemorales/query-key-factory'

import * as authService from '@api/services/auth'

export const me = createQueryKeys('me', {
    detail: {
        queryKey: null,
        queryFn: () => authService.getMe(),
    },
})
