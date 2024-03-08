import { mergeQueryKeys } from '@lukemorales/query-key-factory'

import { users } from './users'
import { chats } from './chats'
import { me } from './me'

export const queries = mergeQueryKeys(users, chats, me)
