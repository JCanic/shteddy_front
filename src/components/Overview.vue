<template>
  <div class = 'black_background'>
    <h2>Welcome, {{ userName }}</h2>
    <br>
    <h3>Your Total Balance: €{{ totalBalance }}</h3>
    <br>
    <div>
      <div class="section">
        <b-form-group label="Filter by Month:" label-for="monthFilter">
          <b-form-select id="monthFilter" v-model="monthFilter" :options="monthOptions"></b-form-select>
        </b-form-group>
      </div>


<!--      <b-form-group label="Filter by Category:" label-for="categoryFilter">
        <b-form-select id="categoryFilter" v-model="categoryFilter" :options="categoryOptions"></b-form-select>
      </b-form-group>-->

      <b-button @click="applyFilters" variant="primary">Apply Filters</b-button>
    </div>

    <div class="section">
    <b-button @click="toggleTransactions" variant="info">
      {{ showTransactions ? 'Hide' : 'Show' }} Transactions
    </b-button>
    </div>


    <div v-if="showTransactions">
      <b-table
          :items="transactions"
          :fields="tableFields"
          :sort-by.sync="sortBy"
          :sort-desc.sync="sortDesc"
          :sort-direction="sortDirection"
          @head-clicked="sort"
          responsive="sm"
          class="mt-3"
      >
        <template #cell(date)="row">
          <div v-if="currentlyEditing === row.item.transactionID">
            <input type="date" v-model="row.item.date" />
          </div>
          <div v-else>
            {{ row.item.date }}
          </div>
        </template>

        <!-- Amount Field -->
        <template #cell(amount)="row">
          <div v-if="currentlyEditing === row.item.transactionID">
            <input type="number" v-model="row.item.amount" />
          </div>
          <div v-else>
            {{ row.item.amount | currencyFilter }}
          </div>
        </template>

        <!-- Category Field -->
        <template #cell(categoryName)="row">
          <div v-if="currentlyEditing === row.item.transactionID">
            <select id="category">
              <option v-for="category in categories" :value="category.categoryID" :key="category.categoryID">
                {{ category.name }}
              </option>
            </select>
          </div>
          <div v-else>
            {{ row.item.categoryName }}
          </div>
        </template>


        <!-- Description Field -->
        <template #cell(description)="row">
          <div v-if="currentlyEditing === row.item.transactionID">
            <input type="text" v-model="row.item.description" />
          </div>
          <div v-else>
            {{ row.item.description }}
          </div>
        </template>

        <!-- Actions Field -->
        <template #cell(actions)="row">
          <div v-if="currentlyEditing === row.item.transactionID">
            <b-button size="sm" @click="saveEdit(row.item)">Save</b-button>
            <b-button size="sm" variant="danger" @click="cancelEdit">Cancel</b-button>
          </div>
          <div v-else>
            <b-button size="sm" @click="startEditing(row.item.transactionID)">Edit</b-button>
            <b-button size="sm" variant="danger" @click="deleteTransaction(row.item)">Delete</b-button>
          </div>
        </template>
      </b-table>

      <div v-if="!transactions.length" class="text-muted">No transactions to display</div>
    </div>

    <create-transaction :account-id="accountId" @transaction-added="fetchTransactions" />
  <br>
    <div class="import-transactions-group">
      <label for="file-input">Import Transactions:</label>
      <input type="file"
             id="file-input"
             @change="handleFileUpload"
             accept=".xlsx, .xls"
             class="file-input"
      />
      <b-button @click="importTransactions" variant="success" :disabled="!selectedFile">
        Import
      </b-button>
    </div>

    <Chart />
  </div>



</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { BFormGroup, BFormSelect, BButton, BTable } from 'bootstrap-vue-3';
import axios from 'axios';
import CreateTransaction from './CreateTransaction.vue';
import Chart from './Chart.vue'; // Adjust the import path as needed


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

const sort = (field) => {
  if (sortBy.value === field) {
    sortDesc.value = !sortDesc.value;
  } else {
    sortBy.value = field;
    sortDesc.value = false;
  }
};


const sortBy = ref('');
const sortDesc = ref(false);
const sortDirection = ref('asc');


const categories = ref([]);


const applyFilters = () => {
  fetchTransactions(monthFilter.value);
}

const tableFields = [
  { key: 'date', label: 'Date', sortable: true },
  { key: 'transactionType', label: 'Type', sortable: true },
  { key: 'amount', label: 'Amount', sortable: true },
  { key: 'categoryName', label: 'Category', sortable: true },
  { key: 'description', label: 'Description', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false }
];

const fetchCategories = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/categories');
    categories.value = response.data;
  } catch (err) {
    console.error('Failed to fetch categories:', err);
  }
};

onMounted(() => {
  fetchCategories();
});

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

const selectedFile = ref(null);

const handleFileUpload = (event) => {
  const files = event.target.files;
  if (files.length > 0) {
    selectedFile.value = files[0];
  }
};

const importTransactions = async () => {
  // Ensure that a file has been selected
  if (!selectedFile.value) {
    alert("Please select a file first.");
    return;
  }

  const formData = new FormData();
  formData.append('file', selectedFile.value);

  try {
    const response = await axios.post('http://localhost:8080/api/import_transactions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    alert('Transactions imported successfully');
    fetchTransactions(); // Refresh the transactions list
  } catch (error) {
    console.error('Failed to import transactions:', error);
    alert('Failed to import transactions');
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

const deleteTransaction = async (transaction) => {
  if (!confirm('Are you sure you want to delete this transaction?')) {
    return;
  }

  try {
    const response = await axios.delete(`http://localhost:8080/api/transactions/${transaction.transactionID}`);
    if (response.status === 200) {
      transactions.value = transactions.value.filter(t => t.transactionID !== transaction.transactionID);
      alert('Transaction deleted successfully');
    } else {
      alert('Failed to delete transaction');
    }
  } catch (error) {
    console.error('Error deleting transaction:', error);
    alert('Failed to delete transaction');
  }
};

const currentlyEditing = ref(null);

const startEditing = (transactionID) => {
  currentlyEditing.value = transactionID;
};

const saveEdit = async (transaction) => {
  try {
    await axios.put(`http://localhost:8080/api/transactions/${transaction.transactionID}`, transaction);
    alert('Transaction updated successfully');
    fetchTransactions();
  } catch (error) {
    console.error('Error updating transaction:', error);
    alert('Failed to update transaction');
  }
  currentlyEditing.value = null;
};

const cancelEdit = () => {
  currentlyEditing.value = null;
  // Optionally refresh the list to discard changes
  fetchTransactions();
};


const startEditingTransaction = (transaction) => {
  console.log('Editing transaction:', transaction);
  currentlyEditing.value = { ...transaction };
};


const saveTransaction = async (transaction) => {
  try {
    const response = await axios.put(`http://localhost:8080/api/transactions/${transaction.transactionID}`, transaction);
    if (response.status === 200) {
      // Update the transactions list with the updated data
      const index = transactions.value.findIndex(t => t.transactionID === transaction.transactionID);
      if (index !== -1) {
        transactions.value[index] = response.data;
      }
      currentlyEditing.value = null;
      alert('Transaction updated successfully');
    } else {
      alert('Failed to update transaction');
    }
  } catch (error) {
    console.error('Error updating transaction:', error);
    alert('Failed to update transaction');
  }
};

const cancelEditing = () => {
  currentlyEditing.value = null;
};


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

.black_background {
  color: #fff; /* White color */
}

.section {
  margin-bottom: 2rem; /* Adjust the value as needed */
}

/* Apply more vertical padding to table cells */
.transactions-table th,
.transactions-table td {
  padding-top: 1rem; /* Adjust the value as needed */
  padding-bottom: 1rem; /* Adjust the value as needed */
}

/* Increase spacing around buttons and form elements */
button,
input,
select {
  margin-bottom: 1rem; /* Adjust the value as needed */
}

/* Increase spacing inside the buttons */
button {
  padding: 0.75rem 1.5rem; /* Adjust the value as needed */
}

/* Specific styles for the import transactions section */
.import-transactions-group {
  display: flex;
  flex-direction: column;
  align-items: start;
}

/* Style for the file input */
#file-input {
  margin-bottom: 1rem; /* Adjust the value as needed */
}

/* Style for the import button */
.import-button {
  align-self: center;
}


</style>
