<template>
  <div id="app">
    <header>
      <div class="container flex">
        <router-link :to="{ path: '/' }">
          <div class="logo"><img src="./assets/images/logo.svg" /></div>
        </router-link>
        <div class="filter-wrap flex" v-if="$route.name !== 'MovieDetails'">
          <Search />
          <button class="filter-icon" @click="toggleShowFilter"><img src="./assets/images/filter.svg"/></button>
        </div>        
      </div>
    </header>

    <router-view />
  </div>
</template>

<script setup lang="ts">
  import Search from './components/Search.vue';
  import { useStore } from './store';

  const { 
    toggleShowFilter,
} = useStore();

</script>

<style lang="scss">
  @import './assets/scss/reset.scss';
  @import './assets/scss/global.scss';
  @import './assets/scss/variables.scss';
  @import 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap';

  body{
    background: #272b30;
  }

  #app {
    color: $primary-color;
    font-family: $primary-font;
  }  

  header {
    position: sticky;
    top: 0;
    z-index: 1;
    gap: 20px;
    background: rgba(39, 43, 48, 0.95);
    padding: 20px 0;

    .container {
      align-items: center;
      gap: 35px;
    }

    .logo {
      width: 150px;
    }

    .filter-wrap {
      gap: 10px;
      align-items: center;

      .filter-icon {
        width: 18px;        
      }
    }    
  }
</style>
