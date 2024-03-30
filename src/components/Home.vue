<template>
  <div v-if="isLoading" class="loader"></div>
  <Search @update-array="updateArray"/>

  <div class="main-wrap flex">
    <div class="container">
      <h1 v-if="movies.length">{{ title }} Movies</h1>
      <Movies :movies="displayedData" />
    </div>

  </div>    
</template>

<script setup lang="ts">
import Search from '../components/Search.vue';
import { ref, onMounted, onUnmounted, computed } from 'vue';
import Movies from '../components/Movies.vue';
import { useStore } from '../store';
import { Movie, OptionsToSort, TitleOptions } from "../types";
import { getMovies } from '../services';
import { genres } from '../utils';

const { 
  selectedDiscover,
  storedGenre,
  storedGenreID,
  storedMovies,
  updateStoredMovies, 
  updateStoredDiscover, 
  updateStoredGenre, 
  updateStoredGenreID,
  resetPageNumber, 
  resetMoviesList, 
  incrementPageNumber 
} = useStore();

const sortOptions: OptionsToSort = {
    'popular': 'popularity.desc',
    'topRated': 'vote_count.desc'
};  

const titleOptions: TitleOptions = {
    'popular': 'Popular',
    'topRated': 'Top Rated'
};  

const isLoading = ref(false);
const activeDiscoverTab = ref<string>(selectedDiscover);
const title = ref<string>(titleOptions[activeDiscoverTab.value]);
const movies = ref<Movie[]>([]);
const selectedGenre = ref<string>(storedGenre);
const selectedGenreID = ref<number | null>(storedGenreID);

const displayedData = computed(() => {
  return dataArray.value.length ? dataArray.value : movies.value;
});

const dataArray = ref([]);

const updateArray = (newArray: number[]) => {
  dataArray.value = newArray;
};

async function handleDiscoverTab(tab: string) {
    if (activeDiscoverTab.value === tab) return;
    activeDiscoverTab.value = tab;
    updateStoredDiscover(activeDiscoverTab.value);
    resetPageNumber();
    resetGenre();
    movies.value = [];
    isLoading.value = true;
    await handleMovies(sortOptions[tab]);
    title.value = titleOptions[activeDiscoverTab.value];
    isLoading.value = false;
}

async function handleMovies(sort_by: string | number) {
    const data = await getMovies(sort_by);
    if (data) {
        const list = [...movies.value, ...data];
        updateStoredMovies(list);
        movies.value = list; 
    }
}

async function loadMore() {
    isLoading.value = true;
    incrementPageNumber();
    
    let param: string | number | null = null;
    if(selectedGenreID.value !== null){
        param = selectedGenreID.value
    }else{
        param = sortOptions[activeDiscoverTab.value]
    }

    await handleMovies(param);
    isLoading.value = false;
}

async function handleSelectedGenre({genre, genre_id }: {genre: string, genre_id?: number | undefined}) {
    if (selectedGenre.value === genre) return;
    selectedGenre.value = genre;
    selectedGenreID.value = genre_id || null;
    updateStoredGenre(selectedGenre.value);
    updateStoredGenreID(selectedGenreID.value);
    resetDiscover();
    resetPageNumber();
    resetMoviesList();
    movies.value = [];
    isLoading.value = true;
    await handleMovies(genre_id);
    isLoading.value = false;
}

function resetDiscover() {
    activeDiscoverTab.value = "";
    updateStoredDiscover("");
}

function resetGenre() {
    selectedGenre.value = "All";
    updateStoredGenre("All");
    updateStoredGenreID(null);
    selectedGenreID.value = null;
}

function handleScroll() {
    const bottomOffset = 20;
    const bottomPage = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - bottomOffset;
    if (bottomPage) {
        loadMore();
    }    
}

onMounted(async () => {
    isLoading.value = true;
    if (!storedMovies.length) {
        await handleMovies('popular');
    } else {
        movies.value = storedMovies;
    }
    window.addEventListener('scroll', handleScroll);
    isLoading.value = false;    
});

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
});
</script>

<style lang="scss" scoped>
@import '../assets/scss/variables.scss';

h1 {
  font-size: 24px;
  margin: 40px 0 20px;
}
</style>