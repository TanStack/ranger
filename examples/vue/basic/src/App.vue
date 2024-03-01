<script lang="ts" setup>
import { computed, ref } from 'vue'
import { Ranger, useRanger } from '@tanstack/vue-ranger'

const rangerRefEl = ref<HTMLDivElement | null>(null)

const values = ref([10, 15, 50,])

const ranger = useRanger<HTMLDivElement>(computed(() => ({
  min: 0,
  max: 100,
  values: values.value,
  stepSize: 5,

  onChange: (instance: Ranger<HTMLDivElement>) => {
    values.value = instance.sortedValues
  },
  getRangerElement: () => rangerRefEl.value,
})))
</script>

<template>
  <div class="App" :style="{ padding: '10px' }">
    <h1>Basic Range</h1>
    <span>Active Index: {{ ranger.activeHandleIndex }}</span>
    <br />
    <br />
    <div>
      <div
        ref="rangerRefEl"
        :style="{
          position: 'relative',
          userSelect: 'none',
          height: '4px',
          background: '#ddd',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,.6)',
          borderRadius: '2px',
        }"
      >
        <button
          v-for="({
            value,
            onKeyDownHandler,
            onMouseDownHandler,
            onTouchStart,
            isActive,
          }, i) in ranger.handles()"
          :key="i"
          role="slider"
          :aria-valuemin="ranger.options.min"
          :aria-valuemax="ranger.options.max"
          :aria-valuenow="value"
          :style="{
            position: 'absolute',
            top: '50%',
            left: `${ranger.getPercentageForValue(value)}%`,
            zIndex: isActive ? '1' : '0',
            transform: 'translate(-50%, -50%)',
            width: '14px',
            height: '14px',
            outline: 'none',
            borderRadius: '100%',
            background: 'linear-gradient(to bottom, #eee 45%, #ddd 55%)',
            border: 'solid 1px #888',
          }"
          @keydown="onKeyDownHandler"
          @mousedown="onMouseDownHandler"
          @touchstart="onTouchStart"
        />
      </div>
    </div>
    <br />
    <br />
    <br />
    <pre
      :style="{
        display: 'inline-block',
        textAlign: 'left',
      }"
    >
    <code>
      {{ JSON.stringify({ values }) }}
    </code>
    </pre>
  </div>
</template>

<style scoped>

</style>
