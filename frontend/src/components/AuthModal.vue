<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '../composables/useAuth';

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'success'): void;
}>();

const { login, register, isLoading, error } = useAuth();

const mode = ref<'login' | 'register'>('login');
const name = ref('');
const email = ref('');
const password = ref('');
const avatar = ref('boy_cap');

const avatars = [
  { id: 'boy_cap', label: 'Cap Boy', icon: '🧢' },
  { id: 'boy_gamer', label: 'Gamer', icon: '🎧' },
  { id: 'boy_astro', label: 'Astro', icon: '🧑‍🚀' },
  { id: 'boy_ninja', label: 'Ninja', icon: '🥷' },
];

const handleSubmit = async () => {
  try {
    if (mode.value === 'login') {
      await login(email.value, password.value);
    } else {
      await register(name.value, email.value, password.value, avatar.value);
    }
    emit('success');
    emit('close');
  } catch (err) {
    // Error is set in useAuth
  }
};
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
    <div class="w-full max-w-sm bg-white border-4 border-boy-dark rounded-cartoon p-6 shadow-cartoon-lg relative animate-in fade-in zoom-in-95 duration-150">
      <!-- Close Button -->
      <button
        @click="emit('close')"
        class="absolute top-4 right-4 w-8 h-8 rounded-xl border-2 border-boy-dark bg-slate-100 hover:bg-slate-200 text-boy-dark font-black flex items-center justify-center"
      >
        ✕
      </button>

      <!-- Tabs -->
      <div class="flex items-center gap-2 mb-4 p-1 bg-slate-100 rounded-2xl border-2 border-boy-dark">
        <button
          @click="mode = 'login'"
          type="button"
          class="flex-1 py-1.5 rounded-xl text-xs font-black transition-colors"
          :class="mode === 'login' ? 'bg-white border-2 border-boy-dark shadow-cartoon-sm text-boy-dark' : 'text-slate-500'"
        >
          Masuk
        </button>
        <button
          @click="mode = 'register'"
          type="button"
          class="flex-1 py-1.5 rounded-xl text-xs font-black transition-colors"
          :class="mode === 'register' ? 'bg-white border-2 border-boy-dark shadow-cartoon-sm text-boy-dark' : 'text-slate-500'"
        >
          Daftar Akun
        </button>
      </div>

      <!-- Error banner -->
      <div v-if="error" class="mb-4 p-2.5 bg-red-100 border-2 border-red-500 rounded-xl text-xs font-bold text-red-700">
        ⚠️ {{ error }}
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-3">
        <!-- Name (Register only) -->
        <div v-if="mode === 'register'">
          <label class="block text-xs font-black text-boy-dark mb-1">Nama Panggilan</label>
          <input
            v-model="name"
            type="text"
            required
            placeholder="misal: Bima, Alex"
            class="w-full px-3 py-2 rounded-xl border-3 border-boy-dark font-semibold text-sm focus:outline-none focus:ring-4 focus:ring-boy-blue-light"
          />
        </div>

        <!-- Avatar Selection (Register only) -->
        <div v-if="mode === 'register'">
          <label class="block text-xs font-black text-boy-dark mb-1">Pilih Avatar Karakter</label>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="av in avatars"
              :key="av.id"
              type="button"
              @click="avatar = av.id"
              class="p-2 rounded-xl border-2 border-boy-dark flex flex-col items-center justify-center text-lg transition-transform"
              :class="avatar === av.id ? 'bg-boy-butter-light shadow-cartoon-sm scale-105 border-3' : 'bg-slate-50'"
            >
              <span>{{ av.icon }}</span>
              <span class="text-[10px] font-bold mt-0.5">{{ av.label }}</span>
            </button>
          </div>
        </div>

        <!-- Email -->
        <div>
          <label class="block text-xs font-black text-boy-dark mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="kamu@email.com"
            class="w-full px-3 py-2 rounded-xl border-3 border-boy-dark font-semibold text-sm focus:outline-none focus:ring-4 focus:ring-boy-blue-light"
          />
        </div>

        <!-- Password -->
        <div>
          <label class="block text-xs font-black text-boy-dark mb-1">Kata Sandi</label>
          <input
            v-model="password"
            type="password"
            required
            placeholder="Minimal 6 karakter"
            class="w-full px-3 py-2 rounded-xl border-3 border-boy-dark font-semibold text-sm focus:outline-none focus:ring-4 focus:ring-boy-blue-light"
          />
        </div>

        <!-- Submit -->
        <div class="pt-2">
          <button
            type="submit"
            :disabled="isLoading"
            class="btn-cartoon w-full py-2.5 bg-boy-blue hover:bg-boy-blue-light border-3 border-boy-dark rounded-xl shadow-cartoon text-sm font-black flex items-center justify-center gap-2"
          >
            <span>🎮</span>
            <span>{{ isLoading ? 'Memproses...' : mode === 'login' ? 'Masuk Game' : 'Daftar Sekarang' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
