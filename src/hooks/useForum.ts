import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type {
  AuthPayload,
  CreateReplyPayload,
  CreateTopicPayload,
  RegisterPayload,
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

export function useLoginMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: AuthPayload) => login(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.home })
    },
  })
}

export function useRegisterMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.home })
    },
  })
}

export function useLogoutMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.home })
    },
  })
}

export function useCreateTopicMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateTopicPayload) => createTopic(payload),
    onSuccess: (topic) => {
      queryClient.invalidateQueries({ queryKey: forumKeys.home })
      queryClient.invalidateQueries({ queryKey: forumKeys.detail(topic.id) })
    },
  })
}

export function useCreateReplyMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateReplyPayload) => createReply(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: forumKeys.home })
      queryClient.invalidateQueries({ queryKey: forumKeys.detail(variables.topicId) })
    },
  })
}
