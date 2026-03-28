<template>
  <div class="tax-management">
    <div class="management-header">
      <h1>Tax Management</h1>
    </div>

    <!-- Add Tax Rate Form -->
    <div class="add-rate-card">
      <h2>Add Tax Rate</h2>
      <div class="add-rate-row">
        <div class="form-group inline-group">
          <label>Name</label>
          <input v-model="addName" type="text" placeholder="e.g. US Sales Tax" class="form-input" />
        </div>
        <div class="form-group inline-group">
          <label>Rate (%)</label>
          <input v-model="addRatePct" type="number" min="0" max="100" step="0.01" placeholder="e.g. 8.5" class="form-input input-narrow" />
        </div>
        <button @click="addTaxRate" class="btn btn-primary" :disabled="addSaving">
          {{ addSaving ? 'Adding…' : '+ Add' }}
        </button>
      </div>
      <p v-if="addError" class="error-msg">{{ addError }}</p>
    </div>

    <p v-if="loadError" class="error-msg">{{ loadError }}</p>
    <p v-if="loading" class="loading-msg">Loading tax rates…</p>

    <div v-if="!loading" class="tax-rates-table-container">
      <table class="tax-rates-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Rate</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rate in taxRates" :key="rate.id">
            <td>
              <input v-if="editingId === rate.id" v-model="editName" type="text" class="form-input input-inline" />
              <span v-else>{{ rate.name }}</span>
            </td>
            <td class="rate-value">
              <input v-if="editingId === rate.id" v-model="editRatePct" type="number" min="0" max="100" step="0.01" class="form-input input-narrow input-inline" />
              <span v-else>{{ decimalToPct(rate.rate) }}%</span>
            </td>
            <td class="action-buttons">
              <template v-if="editingId === rate.id">
                <button class="btn btn-primary btn-small" @click="saveEdit(rate)" :disabled="editSaving">
                  {{ editSaving ? 'Saving…' : 'Save' }}
                </button>
                <button class="btn btn-secondary btn-small" @click="cancelEdit">Cancel</button>
                <span v-if="editError" class="inline-error">{{ editError }}</span>
              </template>
              <template v-else>
                <button class="btn-edit" @click="startEdit(rate)" title="Edit">✎</button>
                <button class="btn-delete" @click="deleteTaxRate(rate)" title="Delete">🗑️</button>
              </template>
            </td>
          </tr>
          <tr v-if="taxRates.length === 0">
            <td colspan="3" class="empty-row">No tax rates configured yet. Add one above.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'TaxManagement',
  setup() {
    const loading = ref(false)
    const loadError = ref('')
    const taxRates = ref([])

    const addName = ref('')
    const addRatePct = ref('')
    const addError = ref('')
    const addSaving = ref(false)

    const editingId = ref(null)
    const editName = ref('')
    const editRatePct = ref('')
    const editError = ref('')
    const editSaving = ref(false)

    const decimalToPct = (rate) => {
      const n = Math.round(Number(rate) * 10000) / 100
      return n % 1 === 0 ? n.toFixed(0) : n
    }

    const getAuthHeaders = () => {
      const adminToken = String(localStorage.getItem('adminApiToken') || '').trim()
      const authToken = String(localStorage.getItem('authToken') || '').trim()
      return {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
        ...(adminToken && { 'x-admin-token': adminToken }),
      }
    }

    const loadTaxRates = async () => {
      loading.value = true
      loadError.value = ''
      try {
        const response = await fetch('/api/tax-rates')
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Failed to load tax rates')
        taxRates.value = Array.isArray(data.data) ? data.data : []
      } catch (err) {
        loadError.value = err.message
      } finally {
        loading.value = false
      }
    }

    const addTaxRate = async () => {
      const name = String(addName.value || '').trim()
      const pct = Number(addRatePct.value)
      addError.value = ''
      if (!name) { addError.value = 'Name is required.'; return }
      if (!isFinite(pct) || pct < 0 || pct > 100) { addError.value = 'Rate must be between 0 and 100.'; return }

      addSaving.value = true
      try {
        const response = await fetch('/api/tax-rates', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ name, rate: pct / 100 }),
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Failed to add tax rate')
        taxRates.value.push(data)
        addName.value = ''
        addRatePct.value = ''
      } catch (err) {
        addError.value = err.message
      } finally {
        addSaving.value = false
      }
    }

    const startEdit = (rate) => {
      editingId.value = rate.id
      editName.value = rate.name
      editRatePct.value = String(decimalToPct(rate.rate))
      editError.value = ''
    }

    const cancelEdit = () => {
      editingId.value = null
      editName.value = ''
      editRatePct.value = ''
      editError.value = ''
    }

    const saveEdit = async (rate) => {
      const name = String(editName.value || '').trim()
      const pct = Number(editRatePct.value)
      editError.value = ''
      if (!name) { editError.value = 'Name is required.'; return }
      if (!isFinite(pct) || pct < 0 || pct > 100) { editError.value = 'Rate must be between 0 and 100.'; return }

      editSaving.value = true
      try {
        const response = await fetch(`/api/tax-rates/${rate.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ name, rate: pct / 100 }),
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Failed to update tax rate')
        const index = taxRates.value.findIndex((r) => r.id === rate.id)
        if (index !== -1) taxRates.value[index] = data
        cancelEdit()
      } catch (err) {
        editError.value = err.message
      } finally {
        editSaving.value = false
      }
    }

    const deleteTaxRate = async (rate) => {
      if (!confirm(`Delete "${rate.name}"?`)) return
      try {
        const response = await fetch(`/api/tax-rates/${rate.id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        })
        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to delete')
        }
        taxRates.value = taxRates.value.filter((r) => r.id !== rate.id)
      } catch (err) {
        loadError.value = err.message
      }
    }

    onMounted(loadTaxRates)

    return {
      loading,
      loadError,
      taxRates,
      addName,
      addRatePct,
      addError,
      addSaving,
      addTaxRate,
      editingId,
      editName,
      editRatePct,
      editError,
      editSaving,
      startEdit,
      cancelEdit,
      saveEdit,
      deleteTaxRate,
      decimalToPct,
    }
  },
}
</script>

<style scoped>
.tax-management {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.management-header h1 {
  margin: 0;
  color: #333;
}

/* Add rate form */
.add-rate-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.add-rate-card h2 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: #333;
}

.add-rate-row {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
}

.inline-group {
  flex: 1;
  min-width: 160px;
}

.inline-group label {
  display: block;
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 0.4rem;
  color: #555;
}

.input-narrow {
  max-width: 120px;
}

.input-inline {
  padding: 0.4rem 0.6rem;
  font-size: 0.9rem;
}

.error-msg {
  color: #c0392b;
  font-size: 0.9rem;
  margin: 0.5rem 0 0;
}

.loading-msg {
  color: #888;
  padding: 1rem 0;
}

.empty-row {
  text-align: center;
  color: #aaa;
  padding: 2rem;
  font-style: italic;
}

.inline-error {
  color: #c0392b;
  font-size: 0.85rem;
  margin-left: 0.5rem;
}

.management-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e0e0e0;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  font-weight: 600;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
}

.tab-btn:hover {
  color: var(--color-accent);
}

.tab-btn.active {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
}

/* Tax Groups Section */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  margin: 0;
  color: #333;
}

.header-controls {
  display: flex;
  gap: 1rem;
}

.search-input,
.filter-select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.search-input {
  min-width: 200px;
}

.tax-groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.tax-group-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.3s;
}

.tax-group-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.tax-group-card h3 {
  margin: 0;
  color: #333;
}

.group-type-badge {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
}

.type-sales-tax {
  background-color: var(--color-accent);
}

.type-vat {
  background-color: #27ae60;
}

.type-gst {
  background-color: #f39c12;
}

.type-hst {
  background-color: #e74c3c;
}

.type-pst {
  background-color: #9b59b6;
}

.group-details {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.group-details p {
  margin: 0.5rem 0;
  color: #555;
  font-size: 0.95rem;
}

.description {
  color: #666;
  font-style: italic;
}

.group-rules {
  margin-bottom: 1rem;
}

.group-rules h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 0.9rem;
}

.rule-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.rule-badge {
  background-color: #e8f0ff;
  color: var(--color-accent);
  padding: 0.3rem 0.6rem;
  border-radius: 3px;
  font-size: 0.8rem;
  font-weight: 600;
}

.group-stats {
  display: flex;
  gap: 1rem;
  padding: 0.75rem 0;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: #999;
}

.group-actions {
  display: flex;
  gap: 0.5rem;
}

/* Tax Rates Section */
.tax-rates-table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tax-rates-table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background-color: #f5f5f5;
}

th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e0e0e0;
}

td {
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  color: #555;
}

tr:hover {
  background-color: #f9f9f9;
}

.rate-value {
  width: 120px;
}

.rate-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.status-badge {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-badge.active {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.inactive {
  background-color: #f8d7da;
  color: #842029;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-edit,
.btn-delete {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.3s;
}

.btn-edit:hover {
  background-color: #e8f0ff;
  color: var(--color-accent);
}

.btn-delete:hover {
  background-color: #f8d7da;
  color: #842029;
}

/* Tax Rules Section */
.rules-list {
  margin-bottom: 2rem;
}

.rule-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: all 0.3s;
}

.rule-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.rule-card h3 {
  margin: 0;
  color: #333;
}

.rule-priority {
  background-color: #f5f5f5;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #999;
}

.rule-description {
  color: #666;
  margin: 0 0 1rem 0;
}

.rule-conditions {
  background-color: #f9f9f9;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.rule-conditions h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.rule-conditions ul {
  margin: 0;
  padding-left: 1.5rem;
}

.rule-conditions li {
  color: #555;
  font-size: 0.95rem;
  margin: 0.25rem 0;
}

.rule-actions {
  display: flex;
  gap: 0.5rem;
}

/* Settings Section */
.tax-settings-section {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.settings-form {
  max-width: 800px;
}

.settings-group {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e0e0e0;
}

.settings-group:last-child {
  border-bottom: none;
}

.settings-group h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.checkbox-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  margin-bottom: 0.75rem;
}

.checkbox-option input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--color-accent);
}

.checkbox-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  width: 90vw;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
}

.tax-form {
  padding: 1.5rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e0e0e0;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-primary {
  background-color: var(--color-accent);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-accent-dark);
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

.btn-danger {
  background-color: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background-color: #c0392b;
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  .tax-groups-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-controls {
    width: 100%;
    flex-direction: column;
  }

  .search-input,
  .filter-select {
    width: 100%;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .checkbox-list {
    grid-template-columns: 1fr;
  }

  table {
    font-size: 0.85rem;
  }

  th, td {
    padding: 0.75rem;
  }
}
</style>