<template>
  <div class="admin-layout">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'AdminLayout',
}
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background: #f5f5f5;
}
</style>
