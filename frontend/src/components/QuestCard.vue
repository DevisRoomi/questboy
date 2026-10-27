<script setup lang="ts">
import { computed } from 'vue';
import type { Quest } from '../types';

const props = defineProps<{
  quest: Quest;
}>();

const emit = defineEmits<{
  (e: 'toggle', id: number): void;
  (e: 'delete', id: number): void;
}>();

const categoryConfig: Record<string, { label: string; icon: string; bg: string }> = {
  game: { label: 'Gaming', icon: '🎮', bg: 'bg-boy-blue-light' },
  code: { label: 'Coding', icon: '💻', bg: 'bg-boy-lavender-light' },
  workout: { label: 'Olahraga', icon: '🏋️‍♂️', bg: 'bg-boy-orange-light' },
  study: { label: 'Belajar', icon: '📚', bg: 'bg-boy-butter-light' },
  habit: { label: 'Kebiasaan', icon: '⚡', bg: 'bg-boy-mint-light' },
};

const diffConfig: Record<string, { label: string; bg: string }> = {
  easy: { label: 'Easy Peasy', bg: 'bg-boy-mint-light text-boy-mint-dark' },
  medium: { label: 'Medium Grind', bg: 'bg-boy-butter-light text-boy-butter-dark' },
  boss: { label: '🔥 Boss Fight', bg: 'bg-boy-orange-light text-boy-orange-dark' },
};

const cat = computed(() => categoryConfig[props.quest.category] || categoryConfig.game);
const diff = computed(() => diffConfig[props.quest.difficulty] || diffConfig.easy);
const isDone = computed(() => props.quest.status === 'completed');
</script>

<template>
  <div
    class="relative bg-white border-4 border-boy-dark rounded-cartoon p-4 shadow-cartoon transition-all duration-200 hover:-translate-y-1 hover:shadow-cartoon-lg flex flex-col justify-between"
    :class="{ 'opacity-75 bg-slate-50': isDone }"
  >
    <!-- Top Row: Category & Badges -->
    <div>
      <div class="flex items-center justify-between gap-2 mb-2">
        <span
          class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border-2 border-boy-dark text-xs font-black shadow-cartoon-sm"
          :class="cat.bg"
        >
          <span>{{ cat.icon }}</span>
          <span>{{ cat.label }}</span>
        </span>

        <span
          class="text-[11px] font-black px-2 py-0.5 rounded-full border-2 border-boy-dark"
          :class="diff.bg"
        >
          {{ diff.label }}
        </span>
      </div>

      <!-- Title -->
      <h3
        class="text-base font-bold text-boy-dark mt-2 leading-snug break-words"
        :class="{ 'line-through text-slate-400': isDone }"
      >
        {{ quest.title }}
      </h3>
    </div>

    <!-- Bottom Row: Rewards & Toggle Button -->
    <div class="mt-4 pt-3 border-t-2 border-slate-100 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1 text-xs font-black bg-boy-mint-light text-boy-mint-dark border-2 border-boy-dark px-2 py-0.5 rounded-lg shadow-cartoon-sm">
          ⚡ +{{ quest.xp_reward }} XP
        </span>
        <span class="inline-flex items-center gap-1 text-xs font-black bg-boy-butter-light text-boy-butter-dark border-2 border-boy-dark px-2 py-0.5 rounded-lg shadow-cartoon-sm">
          🪙 +{{ quest.gold_reward }}
        </span>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2">
        <button
          @click="emit('delete', quest.id)"
          class="w-8 h-8 rounded-xl border-2 border-boy-dark bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center font-bold text-xs transition-colors"
          title="Hapus Quest"
        >
          ✕
        </button>

        <button
          @click="emit('toggle', quest.id)"
          class="btn-cartoon px-3 py-1.5 rounded-xl border-3 border-boy-dark font-black text-xs flex items-center gap-1.5 shadow-cartoon-sm"
          :class="isDone ? 'bg-boy-mint text-boy-dark' : 'bg-boy-blue hover:bg-boy-blue-light text-boy-dark'"
        >
          <span>{{ isDone ? '✅ Selesai' : '⏳ Kerjakan' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
