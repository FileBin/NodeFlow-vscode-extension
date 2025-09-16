<template>
  <!-- TODO Select stylesheet based on type -->
  <div :style="{left: left, top: top}" class="node">
    <!-- TODO Add slots & Emitters -->
    <div class="slots">
      <div class="endpoint" v-for="slot in getNodeSlots(model)" :title="slot.name"></div>
    </div>
    <div class="emitters">
      <div class="endpoint" v-for="emitter in getNodeEmitters(model)" :title="emitter.name"></div>
    </div>
    <span class="text">
      {{ getNodeLabel(model) }}
    </span>
  </div>
</template>

<style lang="css">
.node {
  position: absolute;
  width: 30px;
  height: 30px;
  background-color: #2294e0;
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
}

.slots {
  position: absolute;
  left: -2px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

.emitters {
  position: absolute;
  right: -2px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

.endpoint {
  background-color: #f35d5d;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  border: 1px #a80d32;
}

.text {
  font-size: 20px;
  margin-top: -0.1em;
  margin-left: -0.1em;
  text-align: center;
  vertical-align: middle;
}
</style>

<script setup lang="ts">
import { getNodeEmitters, getNodeLabel, getNodeSlots } from "shared/models/node";
import { NodeInstance } from "shared/models/nodeDocument";
import { Ref, ref, watch } from "vue";

interface NodeProps {
  model: NodeInstance;
}

const props = defineProps<NodeProps>();

const left = ref('0')
const top = ref('0')

watch(props.model, (a,b) => {
  updatePos(b);
})

function updatePos(model: NodeInstance) {
  left.value = `${model.position.x}px`;
  top.value = `${model.position.y}px`;
}

updatePos(props.model)

</script>
