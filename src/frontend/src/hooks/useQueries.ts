import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Activity,
  ContextExample,
  FeedbackEntry,
  Question,
  UserRole,
} from "../backend.d";
import { useActor } from "./useActor";

// ── Admin session ──────────────────────────────────────────────────────────────

export function useAdminLogin() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (params: { username: string; password: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.adminLogin(params.username, params.password);
    },
  });
}

export function useAdminLogout() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (token: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.adminLogout(token);
    },
    onSuccess: () => {
      qc.clear();
    },
  });
}

export function useIsSessionValid(token: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["sessionValid", token],
    queryFn: async () => {
      if (!actor || !token) return false;
      return actor.isSessionValid(token);
    },
    enabled: !!actor && !isFetching && !!token,
    refetchInterval: 60_000, // re-check every minute
  });
}

// ── Feedback queries ──────────────────────────────────────────────────────────

export function useAllFeedback(token: string | null = null) {
  const { actor, isFetching } = useActor();
  return useQuery<FeedbackEntry[]>({
    queryKey: ["feedback", "all", token],
    queryFn: async () => {
      if (!actor || !token) return [];
      return actor.getAllFeedback(token);
    },
    enabled: !!actor && !isFetching && !!token,
  });
}

export function useFeedbackBySchool(school: string) {
  const { actor, isFetching } = useActor();
  return useQuery<FeedbackEntry[]>({
    queryKey: ["feedback", "school", school],
    queryFn: async () => {
      if (!actor || !school) return [];
      return actor.getFeedbackBySchool(school);
    },
    enabled: !!actor && !isFetching && !!school,
  });
}

export function useFeedbackByDateRange(
  startTs: bigint | null,
  endTs: bigint | null,
) {
  const { actor, isFetching } = useActor();
  return useQuery<FeedbackEntry[]>({
    queryKey: ["feedback", "dateRange", startTs?.toString(), endTs?.toString()],
    queryFn: async () => {
      if (!actor || !startTs || !endTs) return [];
      return actor.getFeedbackByDateRange(startTs, endTs);
    },
    enabled: !!actor && !isFetching && !!startTs && !!endTs,
  });
}

// ── Submit feedback ──────────────────────────────────────────────────────────

export function useSubmitFeedback() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      school: string;
      targetClass: string;
      pedagogicalAlignment: bigint;
      interactionMethod: bigint;
      sensoryExperience: bigint;
      knowledgeTransfer: bigint;
      impactMoment: string;
      environmentalContribution: string;
      additionalComments: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.submitFeedback(
        params.school,
        params.targetClass,
        params.pedagogicalAlignment,
        params.interactionMethod,
        params.sensoryExperience,
        params.knowledgeTransfer,
        params.impactMoment,
        params.environmentalContribution,
        params.additionalComments,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feedback"] });
    },
  });
}

// ── Questions ─────────────────────────────────────────────────────────────────

export function useAllQuestions() {
  const { actor, isFetching } = useActor();
  return useQuery<Question[]>({
    queryKey: ["questions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllQuestions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddQuestion() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      token: string;
      title: string;
      description: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addQuestion(params.token, params.title, params.description);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["questions"] }),
  });
}

export function useUpdateQuestion() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      token: string;
      id: bigint;
      title: string;
      description: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateQuestion(
        params.token,
        params.id,
        params.title,
        params.description,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["questions"] }),
  });
}

export function useDeleteQuestion() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { token: string; id: bigint }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteQuestion(params.token, params.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["questions"] }),
  });
}

// ── Context Examples ──────────────────────────────────────────────────────────

export function useAllContextExamples() {
  const { actor, isFetching } = useActor();
  return useQuery<ContextExample[]>({
    queryKey: ["contextExamples", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllContextExamples();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useContextExamplesBySchoolAndClass(
  school: string,
  targetClass: string,
) {
  const { actor, isFetching } = useActor();
  return useQuery<ContextExample[]>({
    queryKey: ["contextExamples", school, targetClass],
    queryFn: async () => {
      if (!actor || !school || !targetClass) return [];
      return actor.getContextExamplesBySchoolAndClass(school, targetClass);
    },
    enabled: !!actor && !isFetching && !!school && !!targetClass,
  });
}

export function useAddContextExample() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      token: string;
      school: string;
      targetClass: string;
      exampleText: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addContextExample(
        params.token,
        params.school,
        params.targetClass,
        params.exampleText,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contextExamples"] }),
  });
}

export function useUpdateContextExample() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      token: string;
      id: bigint;
      school: string;
      targetClass: string;
      exampleText: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateContextExample(
        params.token,
        params.id,
        params.school,
        params.targetClass,
        params.exampleText,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contextExamples"] }),
  });
}

export function useDeleteContextExample() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { token: string; id: bigint }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteContextExample(params.token, params.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contextExamples"] }),
  });
}

// ── Admin (legacy, kept for compatibility) ────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCallerUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: ["userRole"],
    queryFn: async () => {
      if (!actor) return "guest" as UserRole;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSeedInitialData() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (token: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.seedInitialData(token);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["questions"] });
      qc.invalidateQueries({ queryKey: ["contextExamples"] });
      qc.invalidateQueries({ queryKey: ["feedback"] });
      qc.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}

// ── Activities ────────────────────────────────────────────────────────────────

export function useAllActivities() {
  const { actor, isFetching } = useActor();
  return useQuery<Activity[]>({
    queryKey: ["activities", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllActivities();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useActivitiesBySchoolAndClass(
  school: string,
  targetClass: string,
) {
  const { actor, isFetching } = useActor();
  return useQuery<Activity[]>({
    queryKey: ["activities", school, targetClass],
    queryFn: async () => {
      if (!actor || !school || !targetClass) return [];
      return actor.getActivitiesBySchoolAndClass(school, targetClass);
    },
    enabled: !!actor && !isFetching && !!school && !!targetClass,
  });
}

export function useAddActivity() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      token: string;
      school: string;
      targetClass: string;
      name: string;
      description: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.addActivity(
        params.token,
        params.school,
        params.targetClass,
        params.name,
        params.description,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activities"] }),
  });
}

export function useUpdateActivity() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      token: string;
      id: bigint;
      school: string;
      targetClass: string;
      name: string;
      description: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateActivity(
        params.token,
        params.id,
        params.school,
        params.targetClass,
        params.name,
        params.description,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activities"] }),
  });
}

export function useDeleteActivity() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { token: string; id: bigint }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.deleteActivity(params.token, params.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activities"] }),
  });
}

export function useDeleteFeedback() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { token: string; id: bigint }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.deleteFeedback(params.token, params.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allFeedback"] }),
  });
}

export function useChangeAdminPassword() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (params: {
      token: string;
      newUsername: string;
      newPassword: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.changeAdminPassword(
        params.token,
        params.newUsername,
        params.newPassword,
      );
    },
  });
}
