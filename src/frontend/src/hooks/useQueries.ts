import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Post, UserProfile, UserRole } from '../backend';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Post Queries
export function useGetPosts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ['posts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPosts();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetPostsByMe() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ['myPosts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPostsByMe();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllPosts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Post[] | null>({
    queryKey: ['allPosts'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAllPosts();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSubmitPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, content, tags }: { title: string; content: string; tags: string[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitPost(title, content, tags);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['myPosts'] });
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
    },
  });
}

export function useUpdatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, title, content, tags }: { postId: bigint; title: string; content: string; tags: string[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePost(postId, title, content, tags);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['myPosts'] });
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
    },
  });
}

export function useDeletePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deletePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['myPosts'] });
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
    },
  });
}

export function usePublishPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.publish(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['myPosts'] });
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
    },
  });
}

export function useUnpublishPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unpublish(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['myPosts'] });
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
    },
  });
}
