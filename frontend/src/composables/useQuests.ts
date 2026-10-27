import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { useAuth } from './useAuth';
import type { Quest, StatsResponse } from '../types';
import confetti from 'canvas-confetti';

export function useQuests() {
  const { getAuthHeader, user } = useAuth();
  const queryClient = useQueryClient();

  // 1. Fetch Quests
  const useQuestsList = (statusFilter = 'all') => {
    return useQuery({
      queryKey: ['quests', statusFilter],
      queryFn: async (): Promise<Quest[]> => {
        const url = statusFilter === 'all' ? '/api/quests' : `/api/quests?status=${statusFilter}`;
        const res = await fetch(url, { headers: getAuthHeader() });
        if (!res.ok) throw new Error('Gagal mengambil daftar quest');
        const json = await res.json();
        return json.data || [];
      },
    });
  };

  // 2. Fetch Stats
  const useStats = () => {
    return useQuery({
      queryKey: ['stats'],
      queryFn: async (): Promise<StatsResponse> => {
        const res = await fetch('/api/quests/summary/stats', { headers: getAuthHeader() });
        if (!res.ok) throw new Error('Gagal mengambil statistik');
        const json = await res.json();
        return json.stats;
      },
    });
  };

  // 3. Create Quest Mutation
  const createQuestMutation = useMutation({
    mutationFn: async (payload: { title: string; category: string; difficulty: string; due_date?: string }) => {
      const res = await fetch('/api/quests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Gagal menambahkan quest baru');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  // 4. Toggle Quest Mutation
  const toggleQuestMutation = useMutation({
    mutationFn: async (questId: number) => {
      const res = await fetch(`/api/quests/${questId}/toggle`, {
        method: 'PATCH',
        headers: getAuthHeader(),
      });
      if (!res.ok) throw new Error('Gagal mengubah status quest');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });

      // Celebration effect when completed!
      if (data?.data?.quest?.status === 'completed') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#38BDF8', '#34D399', '#FACC15', '#FB923C', '#A78BFA'],
        });

        if (data.data.user?.leveledUp) {
          // Bigger blast for level up!
          setTimeout(() => {
            confetti({
              particleCount: 120,
              spread: 100,
              origin: { y: 0.6 },
            });
          }, 300);
        }
      }

      // Update local user state if changed
      if (data?.data?.user && user.value) {
        user.value.xp = data.data.user.xp;
        user.value.gold = data.data.user.gold;
        user.value.level = data.data.user.level;
      }
    },
  });

  // 5. Delete Quest Mutation
  const deleteQuestMutation = useMutation({
    mutationFn: async (questId: number) => {
      const res = await fetch(`/api/quests/${questId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
      if (!res.ok) throw new Error('Gagal menghapus quest');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  return {
    useQuestsList,
    useStats,
    createQuestMutation,
    toggleQuestMutation,
    deleteQuestMutation,
  };
}
