<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <section
    class="[background:var(--forum-surface)] border-b [border-color:var(--forum-border)]"
  >
    <div
      class="mx-auto flex max-w-6xl items-start justify-between gap-4 px-6 py-5"
    >
      <div class="min-w-0">
        <h1
          class="m-0 text-lg font-semibold leading-6 [color:var(--forum-text)]"
        >
          {{ title }}
        </h1>
        <p
          v-if="description"
          class="mt-1 text-sm leading-5 [color:var(--forum-text-soft)]"
        >
          {{ description }}
        </p>
      </div>
      <div v-if="$slots.actions" class="flex shrink-0 items-center gap-2">
        <slot name="actions" />
      </div>
    </div>
    <div
      v-if="$slots.default"
      class="mx-auto max-w-6xl px-6 pb-6"
    >
      <slot />
    </div>
  </section>
</template>