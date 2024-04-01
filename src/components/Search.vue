<template>
    <div class="search">
        <div class="inner">
            <input type="text" v-model="searchQuery" @input="search" placeholder="Search for a movie" autofocus />
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue';
    import { debounce } from '../utils';
    import { useStore } from '../store';

    const { 
        updateStoredSearchQuery,
        storedSearchQuery,
    } = useStore();

    const searchQuery = ref(storedSearchQuery);
    const search = debounce(handleSearch, 500);

    function handleSearch() {
        updateStoredSearchQuery(searchQuery.value);
    }
</script>

<style lang="scss" scoped>
    @import '../assets/scss/variables.scss';
    
    .search {

        .inner {
            max-width: 300px;
            position: relative;
        }

        input {
            width: 300px;
            height: 40px;
            padding: 0 15px 0 50px;
            box-shadow: 0 1px 3px 1px rgba(36, 91, 140, 0.15);
            border-radius: 50px;
            background: url('../assets/images/search.svg') no-repeat 20px center #fff;
            font-size: 14px;
            color: initial;
        }
    }  
</style>