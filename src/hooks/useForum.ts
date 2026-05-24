import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/vue-query'
import type {
  CreateReplyPayload,
  CreateTopicPayload,
} from '../types/forum'
import {
  createReply,
  createTopic,
  getForumHome,
  getTopicDetail,
  login,
  logout,
  register,
} from '../services/forumMock'

export const forumKeys = {
  home: ['forum', 'home'] as const,
  detail: (id: string) => ['forum', 'detail', id] as const,
}

export function useForumHomeQuery() {
  return useQuery({
    queryKey: forumKeys.home,
    queryFn: getForumHome,
  })
}

export function useTopicDetailQuery(topicId: string) {
  return useQuery({
    queryKey: forumKeys.detail(topicId),
    queryFn: () => getTopicDetail(topicId),
    enabled: !!topicId,
  })
}

// ---------- Mutation factory ----------

function createForumMutation<TData, TVars>(
  mutationFn: (vars: TVars) => Promise<TData>,
  extraInvalidations?: (data: TData, vars: TVars) => QueryKey[],
) {
  return () => {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn,
      onSuccess: (data, vars) => {
        void queryClient.invalidateQueries({ queryKey: forumKeys.home })
        if (extraInvalidations) {
          for (const key of extraInvalidations(data as TData, vars as TVars)) {
            void queryClient.invalidateQueries({ queryKey: key })
          }
        }
      },
    })
  }
}

export const useLoginMutation = createForumMutation(login)
export const useRegisterMutation = createForumMutation(register)

export function useLogoutMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: forumKeys.home })
    },
  })
}
export const useCreateTopicMutation = createForumMutation(
  (payload: CreateTopicPayload) => createTopic(payload),
  (topic) => [forumKeys.detail(topic.id)],
)
export const useCreateReplyMutation = createForumMutation(
  (payload: CreateReplyPayload) => createReply(payload),
  (_, vars) => [forumKeys.detail(vars.topicId)],
)
