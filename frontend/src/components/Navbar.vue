<script setup lang="ts">
import { useAuth } from '../composables/useAuth';

defineProps<{
  gold?: number;
  level?: number;
}>();

const emit = defineEmits<{
  (e: 'open-auth'): void;
}>();

const { isAuthenticated, user, logout } = useAuth();
</script>

<template>
  <header class="w-full bg-white border-b-4 border-boy-dark px-4 py-3 sticky top-0 z-40">
    <div class="max-w-5xl mx-auto flex items-center justify-between">
      <!-- Brand Logo -->
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 bg-boy-blue rounded-2xl border-4 border-boy-dark shadow-cartoon-sm flex items-center justify-center text-xl select-none rotate-[-4deg]">
          🎮
        </div>
        <div>
          <h1 class="text-2xl font-black tracking-tight text-boy-dark leading-none flex items-center gap-1">
            QUEST<span class="text-boy-blue-dark">BOY</span>
            <span class="text-xs bg-boy-butter border-2 border-boy-dark px-2 py-0.5 rounded-full font-bold ml-1 shadow-cartoon-sm">
              LVL UP!
            </span>
          </h1>
          <p class="text-xs font-semibold text-slate-500">Santrikoding Bun • Hono • Vue</p>
        </div>
      </div>

      <!-- Right Actions -->
      <div class="flex items-center gap-3">
        <template v-if="isAuthenticated">
          <!-- Gold Pill -->
          <div class="flex items-center gap-1.5 bg-boy-butter-light border-3 border-boy-dark px-3 py-1 rounded-2xl shadow-cartoon-sm font-bold text-sm">
            <span>🪙</span>
            <span>{{ gold ?? user?.gold ?? 0 }}</span>
          </div>

          <!-- Level Pill -->
          <div class="hidden sm:flex items-center gap-1 bg-boy-mint-light border-3 border-boy-dark px-3 py-1 rounded-2xl shadow-cartoon-sm font-bold text-sm">
            <span>⭐</span>
            <span>Lvl {{ level ?? user?.level ?? 1 }}</span>
          </div>

          <!-- User Name & Logout -->
          <div class="flex items-center gap-2 pl-2 border-l-2 border-slate-200">
            <span class="hidden md:inline font-bold text-sm text-boy-dark truncate max-w-[120px]">
              {{ user?.name }}
            </span>
            <button
              @click="logout"
              class="btn-cartoon bg-boy-orange-light hover:bg-boy-orange border-3 border-boy-dark text-boy-dark px-3 py-1 rounded-xl shadow-cartoon-sm text-xs font-bold"
            >
              Keluar
            </button>
          </div>
        </template>

        <template v-else>
          <button
            @click="emit('open-auth')"
            class="btn-cartoon bg-boy-blue hover:bg-boy-blue-light border-3 border-boy-dark text-boy-dark px-4 py-2 rounded-2xl shadow-cartoon text-sm font-black flex items-center gap-1.5"
          >
            <span>🚀</span> Masuk / Daftar
          </button>
        </template>
      </div>
    </div>
  </header>
</template>
