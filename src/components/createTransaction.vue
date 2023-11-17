<template>
  <div>
    <h3>Add New Transaction</h3>
    <form @submit.prevent="submitTransaction">
      <div class="form-group">
        <label for="date">Date:</label>
        <input type="date" id="date" v-model="newTransaction.date" required>
      </div>
      <div class="form-group">
        <label for="type">Type:</label>
        <select id="type" v-model="newTransaction.transactionType" required>
          <option value="debit">Debit</option>
          <option value="credit">Credit</option>
        </select>
      </div>
      <div class="form-group">
        <label for="amount">Amount:</label>
        <input type="number" id="amount" v-model.number="newTransaction.amount" required>
      </div>
      <div class="form-group">
        <label for="category">Category:</label>
        <select id="category" v-model="newTransaction.categoryId" required>
          <option v-for="category in categories" :value="category.categoryID" :key="category.categoryID">
            {{ category.name }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="description">Description:</label>
        <input type="text" id="description" v-model="newTransaction.description">
      </div>
      <button type="submit">Add Transaction</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const props = defineProps({
  accountId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['transaction-added']);

const categories = ref([]);

const fetchCategories = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/categories');
    categories.value = response.data;
  } catch (err) {
    console.error('Failed to fetch categories:', err);
  }
};

const newTransaction = ref({
  date: '',
  transactionType: 'debit',
  amount: null,
  description: '',
  accountId: parseInt(props.accountId)
});

const submitTransaction = async () => {
  try {
    const transactionData = {
      date: newTransaction.value.date,
      transactionType: newTransaction.value.transactionType,
      amount: newTransaction.value.amount,
      description: newTransaction.value.description
    };

    const response = await axios.post(
        `http://localhost:8080/api/transactions?accountId=${props.accountId}&categoryId=${newTransaction.value.categoryId}`,
        transactionData
    );
    alert('Transaction added!');
    emit('transaction-added'); // Emit the event here
    newTransaction.value = { date: '', transactionType: 'debit', amount: null, description: '', categoryId: null };
  } catch (err) {
    alert('Failed to add transaction: ' + err.message);
  }

  if (response.status === 201) {
    emit('transaction-added');
    await fetchTotalBalance();
    newTransaction.value = { date: '', transactionType: 'debit', amount: null, description: '', categoryId: null };
  } else {
    alert('Failed to add transaction: ' + response.statusText);
  }
};


onMounted(() => {
  fetchCategories();
});

</script>
