<script setup lang="ts">
import Settings from "./components/Settings.vue"
import Desert from "./components/Desert.vue"

import { useDesertStore } from "./stores/desert"
const store = useDesertStore()
//store.init(300, 200)
store.init(60, 60)
</script>

<template>
  <v-app>
    <Settings />
    <v-main class="align-center flex justify-center">
      <Desert />
    </v-main>
  </v-app>
</template>
