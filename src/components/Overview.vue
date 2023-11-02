<template>
  <div>
    <h2>Overview of User Accounts</h2>
    <ul v-if="accounts && accounts.length">
      <li v-for="account in accounts" :key="account.id">
        {{ account.accountNumber }}
      </li>
    </ul>
    <p v-if="error">{{ error }}</p>
    <p v-if="loading">Loading accounts...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const accounts = ref([]);
const error = ref(null);
const loading = ref(true);

const fetchAccounts = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/accounts');
    accounts.value = response.data;
  } catch (err) {
    error.value = 'Failed to fetch accounts.';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchAccounts);
</script>
