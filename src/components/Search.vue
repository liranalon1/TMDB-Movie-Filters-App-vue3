<template>
    <div class="search">
        <div class="inner">
            <div v-if="loaderSmall" class="small-loader"></div>
            <input type="text" v-model="searchQuery" @input="search" placeholder="Search for a movie" autofocus />
        </div>
        <SearchResults v-if="showResults && filteredResults.length" :results="filteredResults" @closeResults="isClose" />
    </div>
</template>

<script setup lang="ts">
    import SearchResults from '../components/SearchResults.vue'
    import { ref, computed, onMounted, onUnmounted, defineEmits } from 'vue';
    import { debounce } from '../utils';
    import { Movie } from '../types';
    import { searchMovies } from '../services';
    import { useStore } from '../store';

    const emits = defineEmits(['update-array']);

    const loaderSmall = ref(false);
    const searchQuery = ref('');
    const searchResults = ref<Movie[]>([]);
    const showResults = ref(false);
    const search = debounce(handleSearch, 500);

    const filteredResults = computed(() => {
        return searchResults.value.filter(movie =>
            movie.title.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
    });

    function isClose(newValue: boolean) {
        showResults.value = newValue;
    };

    function handleClickOutside(event: MouseEvent) {
        const target = event.target as HTMLElement;
        const searchElem = document.querySelector('.search');

        if (searchElem && !searchElem.contains(target)) {
            showResults.value = false;
        }
    };

    async function handleSearch() {
        // loaderSmall.value = true;
        const data = await searchMovies(searchQuery.value);
        if (data) {
            emits('update-array', data);
            // searchResults.value = data;
            // loaderSmall.value = false;
            // showResults.value = true;
        }
    };

    onMounted(() => {
        document.addEventListener('click', handleClickOutside);
    });

    onUnmounted(() => {
        document.removeEventListener('click', handleClickOutside);
    });
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