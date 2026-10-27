<script setup lang="ts">
import { computed } from 'vue';
import type { StatsResponse } from '../types';

const props = defineProps<{
  stats?: StatsResponse | null;
}>();

const user = computed(() => props.stats?.user);

const xpPercent = computed(() => {
  if (!user.value) return 0;
  const current = user.value.currentLevelXp ?? 0;
  const next = user.value.nextLevelXp ?? 100;
  return Math.min(100, Math.round((current / next) * 100));
});

const boyTitles: Record<number, string> = {
  1: 'Rookie Boy 🛹',
  2: 'Arcade Kid 🕹️',
  3: 'Quest Explorer 🧭',
  4: 'Code Knight ⚔️',
  5: 'Boss Slayer 👑',
};

const currentTitle = computed(() => {
  const lvl = user.value?.level || 1;
  return boyTitles[Math.min(lvl, 5)] || 'Legendary Boy 🔥';
});
</script>

<template>
  <div class="bg-boy-cream border-4 border-boy-dark rounded-cartoon p-5 md:p-6 shadow-cartoon mb-8">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
      <!-- Avatar & Bio -->
      <div class="md:col-span-5 flex items-center gap-4">
        <div class="relative">
          <div class="w-20 h-20 bg-boy-lavender-light border-4 border-boy-dark rounded-3xl shadow-cartoon flex items-center justify-center text-4xl select-none rotate-[-3deg]">
            🧑‍🚀
          </div>
          <span class="absolute -bottom-2 -right-2 bg-boy-butter border-2 border-boy-dark px-2 py-0.5 rounded-full text-xs font-black shadow-cartoon-sm">
            Lv.{{ user?.level || 1 }}
          </span>
        </div>

        <div>
          <span class="inline-block bg-boy-blue-light border-2 border-boy-dark px-2.5 py-0.5 rounded-full text-xs font-bold text-boy-dark mb-1 shadow-cartoon-sm">
            {{ currentTitle }}
          </span>
          <h2 class="text-2xl font-black text-boy-dark leading-tight">
            {{ user?.name || 'Player 1' }}
          </h2>
          <p class="text-xs font-semibold text-slate-500">
            {{ user?.email || 'Siap berpetualang hari ini!' }}
          </p>
        </div>
      </div>

      <!-- XP Bar & Level Tracker -->
      <div class="md:col-span-7 flex flex-col gap-3">
        <div>
          <div class="flex justify-between items-center text-xs font-bold mb-1.5">
            <span class="flex items-center gap-1 text-boy-dark">
              ⚡ XP PROGRESS
            </span>
            <span class="text-slate-600 font-mono">
              {{ user?.currentLevelXp || 0 }} / {{ user?.nextLevelXp || 100 }} XP ({{ xpPercent }}%)
            </span>
          </div>

          <!-- Progress Bar -->
          <div class="w-full h-5 bg-white border-3 border-boy-dark rounded-full overflow-hidden p-0.5 shadow-cartoon-sm">
            <div
              class="h-full bg-boy-mint rounded-full transition-all duration-500 ease-out border-r-2 border-boy-dark"
              :style="{ width: `${xpPercent}%` }"
            ></div>
          </div>
        </div>

        <!-- Quick Summary Mini Cards -->
        <div class="grid grid-cols-3 gap-2 pt-1">
          <div class="bg-white border-3 border-boy-dark rounded-2xl p-2.5 text-center shadow-cartoon-sm">
            <div class="text-xs font-bold text-slate-500">QUESTS</div>
            <div class="text-lg font-black text-boy-dark leading-none mt-1">
              {{ stats?.totalQuests || 0 }}
            </div>
          </div>

          <div class="bg-white border-3 border-boy-dark rounded-2xl p-2.5 text-center shadow-cartoon-sm">
            <div class="text-xs font-bold text-slate-500">SELESAI</div>
            <div class="text-lg font-black text-boy-mint-dark leading-none mt-1">
              {{ stats?.completedQuests || 0 }}
            </div>
          </div>

          <div class="bg-white border-3 border-boy-dark rounded-2xl p-2.5 text-center shadow-cartoon-sm">
            <div class="text-xs font-bold text-slate-500">KOIN EMAS</div>
            <div class="text-lg font-black text-boy-butter-dark leading-none mt-1">
              {{ user?.gold || 0 }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
