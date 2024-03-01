<script setup lang="ts">
import Settings from "./components/Settings.vue"
import Desert from "./components/Desert.vue"

import { useDesertStore } from "./stores/desert"
const store = useDesertStore()
store.init(100, 100)
</script>

<template>
  <v-app>
    <Settings />
    <v-main class="align-center flex justify-center">
      <Desert />
    </v-main>
  </v-app>
</template>
