<template>
  <div v-if="isLoading" class="loader"></div>

  <div class="main-wrap flex">
  
    <!-- sideBar -->
    <div class="side-bar">
      <div class="filter flex" v-if="genres.length">
        <div class="filter-group">
          <h2>Discover</h2>
          <ul class="flex">
            <li :class="{ active: activeDiscoverTab === 'popular' }" @click="handleDiscoverTab('popular')">Popular</li>
            <li :class="{ active: activeDiscoverTab === 'topRated' }" @click="handleDiscoverTab('topRated')">Top Rated</li>
          </ul>
        </div>
        <div class="filter-group">
          <h2>Genres</h2>
          <ul class="flex">
            <li :class="{ active: selectedGenre === 'All' }" @click="handleSelectedGenre({genre: 'All'})">All</li>
            <li v-for="genre in genres" :key="genre.id" :class="{ active: selectedGenre === genre.name }" @click="handleSelectedGenre({genre: genre.name, genre_id: genre.id})">{{ genre.name }}</li>
          </ul>
        </div>        
      </div>
    </div>
    <!-- /sideBar -->

    <div class="container">
      <h1 v-if="movies.length">{{ title }} Movies</h1>
      <Movies :movies="movies" />
    </div>

  </div>    
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
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

.side-bar {
    width: 200px;
    padding: 20px;

    .filter {
      position: sticky;
      top: 90px;
      flex-direction: column;
      gap: 30px;
      margin-top: 70px;
      overflow-y: auto;
      overflow-x: hidden;
      max-height: 80vh;    

      h2 {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 20px;    
      }

      ul{
        flex-direction: column;
        gap: 10px;
        padding: 0 10px;

        li{
          width: fit-content;
          cursor: pointer;
          font-size: 15px;
          transition: 0.2s;

          &:hover, &.active  {
            color: $gold-color;
          }

          &.active {
            font-weight: bold;
          }
        }
      }
    }    
}

h1 {
  font-size: 24px;
  margin: 40px 0 20px;
}
</style>