<script setup>

</script>

<template>
  <main>
    <router-view />
  </main>
</template>

<style>
@import './styles/fonts.css';
@import './styles/colors.css';

body {
  margin: 0;
  padding: 0;
  font-family: var(--font-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--color-gray-50);
  color: var(--color-gray-800);
}

#app {
  min-height: 100vh;
}
</style>



