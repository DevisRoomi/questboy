<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  show: boolean;
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', data: { title: string; category: string; difficulty: string }): void;
}>();

const title = ref('');
const category = ref<'game' | 'code' | 'workout' | 'study' | 'habit'>('code');
const difficulty = ref<'easy' | 'medium' | 'boss'>('easy');

const categories = [
  { id: 'code', label: 'Coding', icon: '💻' },
  { id: 'game', label: 'Gaming', icon: '🎮' },
  { id: 'workout', label: 'Olahraga', icon: '🏋️‍♂️' },
  { id: 'study', label: 'Belajar', icon: '📚' },
  { id: 'habit', label: 'Kebiasaan', icon: '⚡' },
];

const difficulties = [
  { id: 'easy', label: 'Easy Peasy', reward: '+25 XP / +10 🪙' },
  { id: 'medium', label: 'Medium Grind', reward: '+50 XP / +25 🪙' },
  { id: 'boss', label: 'Boss Fight 🔥', reward: '+120 XP / +60 🪙' },
];

const handleSubmit = () => {
  if (!title.value.trim()) return;
  emit('submit', {
    title: title.value.trim(),
    category: category.value,
    difficulty: difficulty.value,
  });
  title.value = '';
};
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
    <div class="w-full max-w-md bg-white border-4 border-boy-dark rounded-cartoon p-6 shadow-cartoon-lg relative animate-in fade-in zoom-in-95 duration-150">
      <!-- Close button -->
      <button
        @click="emit('close')"
        class="absolute top-4 right-4 w-9 h-9 rounded-2xl border-3 border-boy-dark bg-boy-orange-light hover:bg-boy-orange text-boy-dark font-black flex items-center justify-center shadow-cartoon-sm"
      >
        ✕
      </button>

      <h3 class="text-2xl font-black text-boy-dark flex items-center gap-2 mb-1">
        <span>⚔️</span> Buat Quest Baru
      </h3>
      <p class="text-xs font-semibold text-slate-500 mb-5">
        Selesaikan misi harian dan raih XP untuk naik level!
      </p>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Title -->
        <div>
          <label class="block text-xs font-black text-boy-dark mb-1.5 uppercase tracking-wide">
            Nama Quest / Misi
          </label>
          <input
            v-model="title"
            type="text"
            required
            placeholder="misal: Push 1 commit ke GitHub, Pushup 20x..."
            class="w-full px-3.5 py-2.5 rounded-2xl border-3 border-boy-dark font-semibold text-sm focus:outline-none focus:ring-4 focus:ring-boy-blue-light placeholder:text-slate-400"
          />
        </div>

        <!-- Category Selector -->
        <div>
          <label class="block text-xs font-black text-boy-dark mb-1.5 uppercase tracking-wide">
            Kategori
          </label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="cat in categories"
              :key="cat.id"
              type="button"
              @click="category = cat.id as any"
              class="btn-cartoon p-2 rounded-xl border-3 border-boy-dark font-bold text-xs flex items-center justify-center gap-1.5"
              :class="category === cat.id ? 'bg-boy-blue text-boy-dark shadow-cartoon-sm' : 'bg-slate-50 text-slate-600'"
            >
              <span>{{ cat.icon }}</span>
              <span>{{ cat.label }}</span>
            </button>
          </div>
        </div>

        <!-- Difficulty Selector -->
        <div>
          <label class="block text-xs font-black text-boy-dark mb-1.5 uppercase tracking-wide">
            Tingkat Kesulitan & Hadiah
          </label>
          <div class="space-y-2">
            <div
              v-for="diff in difficulties"
              :key="diff.id"
              @click="difficulty = diff.id as any"
              class="p-2.5 rounded-2xl border-3 border-boy-dark cursor-pointer flex items-center justify-between transition-colors"
              :class="difficulty === diff.id ? 'bg-boy-butter-light shadow-cartoon-sm font-black' : 'bg-slate-50 hover:bg-slate-100 font-semibold'"
            >
              <span class="text-xs text-boy-dark">{{ diff.label }}</span>
              <span class="text-xs text-boy-mint-dark font-mono font-bold">{{ diff.reward }}</span>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="pt-2">
          <button
            type="submit"
            :disabled="isLoading"
            class="btn-cartoon w-full py-3 bg-boy-mint hover:bg-boy-mint-dark hover:text-white border-3 border-boy-dark rounded-2xl shadow-cartoon text-sm font-black flex items-center justify-center gap-2"
          >
            <span>🚀</span>
            <span>{{ isLoading ? 'Menyimpan...' : 'Mulai Petualangan!' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
