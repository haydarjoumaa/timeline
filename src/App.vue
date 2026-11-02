<template>
  <!-- Demo page for the <Timeline> component -->
  <Timeline v-model:data="data" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Timeline from './components/Timeline.vue'
import { buildDemoData } from './utils/demoData'

const data = ref(buildDemoData())
</script>
