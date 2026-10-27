<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Navbar from './components/Navbar.vue';
import HeroStats from './components/HeroStats.vue';
import QuestCard from './components/QuestCard.vue';
import QuestModal from './components/QuestModal.vue';
import AuthModal from './components/AuthModal.vue';
import { useAuth } from './composables/useAuth';
import { useQuests } from './composables/useQuests';

const { isAuthenticated, fetchProfile } = useAuth();
const { useQuestsList, useStats, createQuestMutation, toggleQuestMutation, deleteQuestMutation } = useQuests();

const currentFilter = ref<'all' | 'todo' | 'completed'>('all');
const showQuestModal = ref(false);
const showAuthModal = ref(false);

// Queries
const { data: questsList, isLoading: isQuestsLoading, refetch: refetchQuests } = useQuestsList(currentFilter.value);
const { data: statsData, refetch: refetchStats } = useStats();

onMounted(async () => {
  await fetchProfile();
  refetchQuests();
  refetchStats();
});

const handleFilterChange = (filter: 'all' | 'todo' | 'completed') => {
  currentFilter.value = filter;
  refetchQuests();
};

const handleCreateQuest = async (payload: { title: string; category: string; difficulty: string }) => {
  try {
    await createQuestMutation.mutateAsync(payload);
    showQuestModal.value = false;
  } catch (err) {
    console.error('Failed to create quest:', err);
  }
};

const handleToggleQuest = (id: number) => {
  toggleQuestMutation.mutate(id);
};

const handleDeleteQuest = (id: number) => {
  if (confirm('Yakin ingin menghapus quest ini?')) {
    deleteQuestMutation.mutate(id);
  }
};

const handleOpenCreate = () => {
  if (!isAuthenticated.value) {
    showAuthModal.value = true;
  } else {
    showQuestModal.value = true;
  }
};
</script>

<template>
  <div class="min-h-screen bg-[#F0FDF4] pb-16 flex flex-col justify-between">
    <div>
      <Navbar
        :gold="statsData?.user?.gold"
        :level="statsData?.user?.level"
        @open-auth="showAuthModal = true"
      />

      <main class="max-w-5xl mx-auto px-4 pt-6">
        <!-- Hero & Stats Header -->
        <HeroStats :stats="statsData" />

        <!-- Control Bar: Filter Tabs & Add Button -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
          <!-- Filters -->
          <div class="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border-3 border-boy-dark shadow-cartoon-sm">
            <button
              @click="handleFilterChange('all')"
              class="px-3.5 py-1.5 rounded-xl text-xs font-black transition-all"
              :class="currentFilter === 'all' ? 'bg-boy-blue border-2 border-boy-dark shadow-cartoon-sm text-boy-dark' : 'text-slate-500 hover:text-boy-dark'"
            >
              Semua Misi
            </button>
            <button
              @click="handleFilterChange('todo')"
              class="px-3.5 py-1.5 rounded-xl text-xs font-black transition-all"
              :class="currentFilter === 'todo' ? 'bg-boy-butter border-2 border-boy-dark shadow-cartoon-sm text-boy-dark' : 'text-slate-500 hover:text-boy-dark'"
            >
              ⏳ Belum ({{ statsData?.todoQuests ?? 0 }})
            </button>
            <button
              @click="handleFilterChange('completed')"
              class="px-3.5 py-1.5 rounded-xl text-xs font-black transition-all"
              :class="currentFilter === 'completed' ? 'bg-boy-mint border-2 border-boy-dark shadow-cartoon-sm text-boy-dark' : 'text-slate-500 hover:text-boy-dark'"
            >
              ✅ Selesai ({{ statsData?.completedQuests ?? 0 }})
            </button>
          </div>

          <!-- Add Quest Button -->
          <button
            @click="handleOpenCreate"
            class="btn-cartoon bg-boy-mint hover:bg-boy-mint-dark hover:text-white border-3 border-boy-dark px-5 py-2.5 rounded-2xl shadow-cartoon text-sm font-black flex items-center justify-center gap-2"
          >
            <span class="text-base leading-none">⚔️</span>
            <span>Tambah Misi Baru</span>
          </button>
        </div>

        <!-- Quests Grid -->
        <div v-if="isQuestsLoading" class="py-16 text-center">
          <div class="inline-block animate-spin text-3xl mb-2">🕹️</div>
          <p class="font-bold text-slate-500">Memuat misi petualangan...</p>
        </div>

        <div
          v-else-if="questsList && questsList.length > 0"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <QuestCard
            v-for="quest in questsList"
            :key="quest.id"
            :quest="quest"
            @toggle="handleToggleQuest"
            @delete="handleDeleteQuest"
          />
        </div>

        <!-- Empty State -->
        <div
          v-else
          class="bg-white border-4 border-dashed border-boy-dark/40 rounded-cartoon p-10 text-center shadow-cartoon-sm my-6"
        >
          <div class="text-5xl mb-3">🎯</div>
          <h4 class="text-xl font-black text-boy-dark mb-1">Belum Ada Misi</h4>
          <p class="text-xs font-semibold text-slate-500 max-w-sm mx-auto mb-4">
            Kamu belum membuat quest untuk kategori ini. Tekan tombol di bawah untuk menambahkan tantangan baru!
          </p>
          <button
            @click="handleOpenCreate"
            class="btn-cartoon inline-flex items-center gap-2 bg-boy-butter hover:bg-boy-butter-dark border-3 border-boy-dark px-4 py-2 rounded-2xl shadow-cartoon text-xs font-black"
          >
            <span>✨</span> Buat Misi Pertamamu
          </button>
        </div>
      </main>
    </div>

    <!-- Footer -->
    <footer class="mt-12 text-center border-t-3 border-slate-200 pt-6 px-4">
      <div class="flex flex-wrap items-center justify-center gap-2 text-[11px] font-bold text-slate-500 mb-2">
        <span class="bg-white border-2 border-boy-dark px-2.5 py-0.5 rounded-full shadow-cartoon-sm">🥟 Bun 1.4</span>
        <span class="bg-white border-2 border-boy-dark px-2.5 py-0.5 rounded-full shadow-cartoon-sm">🔥 Hono v4</span>
        <span class="bg-white border-2 border-boy-dark px-2.5 py-0.5 rounded-full shadow-cartoon-sm">💚 Vue 3.5</span>
        <span class="bg-white border-2 border-boy-dark px-2.5 py-0.5 rounded-full shadow-cartoon-sm">⚡ TanStack Query</span>
        <span class="bg-white border-2 border-boy-dark px-2.5 py-0.5 rounded-full shadow-cartoon-sm">🐬 FlyEnv MySQL</span>
        <span class="bg-white border-2 border-boy-dark px-2.5 py-0.5 rounded-full shadow-cartoon-sm">🚀 Laravel Herd</span>
      </div>
      <p class="text-xs font-bold text-slate-400">
        Santrikoding Fullstack Guide by Fika Ridaul Maulayya • Built by DevisRoomi
      </p>
    </footer>

    <!-- Modals -->
    <QuestModal
      :show="showQuestModal"
      :is-loading="createQuestMutation.isPending.value"
      @close="showQuestModal = false"
      @submit="handleCreateQuest"
    />

    <AuthModal
      :show="showAuthModal"
      @close="showAuthModal = false"
      @success="() => { refetchQuests(); refetchStats(); }"
    />
  </div>
</template>
