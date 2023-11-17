<template>
  <div>
    <h2>Welcome, {{ userName }}</h2>
    <h3>Your Total Balance: €{{ totalBalance }}</h3>

    <div>
      <b-form-group label="Filter by Month:" label-for="monthFilter">
        <b-form-select id="monthFilter" v-model="monthFilter" :options="monthOptions"></b-form-select>
      </b-form-group>


<!--      <b-form-group label="Filter by Category:" label-for="categoryFilter">
        <b-form-select id="categoryFilter" v-model="categoryFilter" :options="categoryOptions"></b-form-select>
      </b-form-group>-->

      <b-button @click="applyFilters" variant="primary">Apply Filters</b-button>
    </div>

    <br>

    <b-button @click="toggleTransactions" variant="info">
      {{ showTransactions ? 'Hide' : 'Show' }} Transactions
    </b-button>

    <div v-if="showTransactions">
      <b-table :items="transactions" :fields="tableFields" responsive="sm" class="mt-3"></b-table>
      <div v-if="!transactions.length" class="text-muted">No transactions to display</div>
    </div>

    <create-transaction :account-id="accountId" @transaction-added="fetchTransactions" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { BFormGroup, BFormSelect, BButton, BTable } from 'bootstrap-vue-3';
import axios from 'axios';
import CreateTransaction from './CreateTransaction.vue';

const totalBalance = ref(0);
const transactions = ref([]);
const showTransactions = ref(false); // New reactive property
const userName = ref(localStorage.getItem('userName') || '');
const userId = localStorage.getItem('userId');
const accountId = localStorage.getItem('accountId');
const balancePollingIntervalId = ref(null);

const monthOptions = [
  { value: '', text: 'All Months' },
  { value: '1', text: 'January' },
  { value: '2', text: 'February' },
  { value: '3', text: 'March' },
  { value: '4', text: 'April' },
  { value: '5', text: 'May' },
  { value: '6', text: 'June' },
  { value: '7', text: 'July' },
  { value: '8', text: 'August' },
  { value: '9', text: 'September' },
  { value: '10', text: 'October' },
  { value: '11', text: 'November' },
  { value: '12', text: 'December' },
];

const categories = ref([]);


const applyFilters = () => {
  fetchTransactions(monthFilter.value);
};

const tableFields = [
  { key: 'date', sortable: true },
  { key: 'transactionType', label: 'Type', sortable: true },
  { key: 'amount', sortable: true },
  { key: 'categoryName', label: 'Category' },
  { key: 'description', sortable: true },
];


const fetchTransactions = async (month = '', category = '') => {
  let query = `http://localhost:8080/api/user/${userId}/transactions`;
  if (month || category) {
    query += `?month=${month}&category=${category}`;
  }

  try {
    const response = await axios.get(query);
    transactions.value = response.data;
  } catch (err) {
    console.error('Failed to fetch transactions:', err);
  }
};


const fetchTotalBalance = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/api/user/${userId}/totalBalance`);
    totalBalance.value = response.data;
  } catch (err) {
    console.error('Failed to fetch total balance:', err);
  }
};

const startBalancePolling = (interval) => {
  fetchTotalBalance();
  setInterval(fetchTotalBalance, interval);
};

// Start polling when the component is mounted
onMounted(() => {
  startBalancePolling(5000);
});

onUnmounted(() => {
  if (balancePollingIntervalId.value) {
    clearInterval(balancePollingIntervalId.value);
  }
});

const toggleTransactions = () => {
  if (!showTransactions.value && transactions.value.length === 0) {
    fetchTransactions();
  }
  showTransactions.value = !showTransactions.value;
};

onMounted(fetchTotalBalance);
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

tr:hover {
  background-color: #f5f5f5;
}

.transactions-table {
  margin-top: 1rem;
}


</style>
