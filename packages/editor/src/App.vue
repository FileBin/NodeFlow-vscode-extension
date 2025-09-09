<script setup lang="ts">
import Editor from './components/Editor.vue';
</script>

<template>
  <Editor />
</template>

<script lang="ts">
import { SetNodeCreatePositionReport } from 'shared/models/message';
import { postMessage } from './utils/vscode';

export default {
  name: 'App',
  data: () => ({}),
  methods: {}
}
</script>