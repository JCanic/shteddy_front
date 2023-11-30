<template>
  <div class = "form-container">
    <h3 style = "color:black">Add New Transaction</h3>
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

<style scoped>

.form-container {
  background-color: #f9f9f9; /* Light grey background */
  border-radius: 8px; /* Rounded corners */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Subtle shadow */
  padding: 20px; /* Spacing inside the container */
  max-width: 400px; /* Maximum width of the form */
  margin: auto; /* Center the form on the page */
}

.form-group {
  margin-bottom: 15px; /* Space between form groups */
}

label {
  display: block;
  margin-bottom: 5px; /* Small space between label and input */
  color: #333; /* Dark grey color for text */
  font-size: 16px; /* Readable font size */
}

input[type="text"],
input[type="number"],
select {
  width: 100%; /* Full width */
  padding: 10px; /* Padding inside the inputs */
  border: 1px solid #ddd; /* Light grey border */
  border-radius: 4px; /* Slightly rounded corners */
  font-size: 16px; /* Matching font size */
}

button {
  background-color: #5cb85c; /* Bootstrap's btn-success color */
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: #4cae4c; /* A shade darker on hover */
}


</style>
