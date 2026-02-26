import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, ApiContactInfo, CarSpecs, PricePredictionResult } from '../backend';
import { toast } from 'sonner';

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

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    onError: (error) => {
      console.error('Failed to save profile:', error);
      toast.error('Failed to save profile');
    },
  });
}

// Contact Info Query (public)
export function useGetApiContactInfo() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ApiContactInfo>({
    queryKey: ['contactInfo'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getApiContactInfo();
    },
    enabled: !!actor && !actorFetching,
    staleTime: Infinity,
  });
}

// Car Price Prediction
export function usePredictCarPrice() {
  const { actor } = useActor();

  return useMutation<PricePredictionResult, Error, CarSpecs>({
    mutationFn: async (carSpecs: CarSpecs) => {
      if (!actor) throw new Error('Actor not available');
      return actor.predictCarPrice(carSpecs);
    },
    onError: (error) => {
      console.error('Failed to predict car price:', error);
      toast.error('Failed to predict car price');
    },
  });
}

// Prediction History
export function useGetPredictionHistory() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<[CarSpecs, PricePredictionResult]>>({
    queryKey: ['predictionHistory'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPredictionHistory();
    },
    enabled: !!actor && !actorFetching,
  });
}
