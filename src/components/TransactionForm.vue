Copy code
<template>
  <div class="transaction-form">
    <div>
      <label for="amount">Amount:</label>
      <input type="number" id="amount" v-model="transactionData.amount">
    </div>const currentlyEditing = ref(null);
    <div>
      <label for="category">Category:</label>
      <select id="category" v-model="transactionData.categoryName">
        <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
      </select>
    </div>
    <div>
      <label for="description">Description:</label>
      <input type="text" id="description" v-model="transactionData.description">
    </div>
    <button @click="save">Save</button>
    <button @click="cancel">Cancel</button>
  </div>
</template>


<script setup>
import { ref, watch, onMounted } from 'vue';
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  transaction: Object
});

const emits = defineEmits(['save', 'cancel']);

const transactionData = ref({ ...props.transaction });

const categories = ref(['Food', 'Utilities', 'Transport', 'Others']);

watch(() => props.transaction, (newTransaction) => {
  transactionData.value = { ...newTransaction };
}, { deep: true });

const save = () => {
  emits('save', transactionData.value);
};

const cancel = () => {
  emits('cancel');
};
</script>
