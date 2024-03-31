<template>
  <div v-if="isLoading" class="loader"></div>
  <div class="filter-wrap flex">
    <Search @update-movies="updateMovies" @update-query="updateSearchQuery"/>
    <button @click="handleFilter">Filter</button>
  </div>
  <div class="main-wrap flex">

<!-- sideBar -->
<div class="side-bar" v-if="showFilter">
      <div class="filter flex" v-if="genres.length">
        <h2>Search filters</h2>
        <div class="filter-group">
          <h2>Rating</h2>
          <ul class="flex">
            <li class="rating-box">
              <input type="number" class="from" value="" placeholder="e.g. 1.0" step="0.1" min="1" max="10" v-model="fromRating" @blur="handleFilterOptions">
              to
              <input type="number" class="to" value="" placeholder="e.g. 10.0" step="0.1" min="1" max="10" v-model="toRating" @blur="handleFilterOptions">
            </li>
          </ul>
        </div>
        <div class="filter-group">
          <h2>Release Year</h2>
          <ul class="flex">
            <li class="year-box">
              <input type="number" class="from" value="" placeholder="e.g. 2000" min="1900" max="2024" v-model="fromYear" @blur="handleFilterOptions">
              to
              <input type="number" class="to" value="" placeholder="e.g. 2024" min="1900" max="2024" v-model="toYear" @blur="handleFilterOptions">
            </li>
          </ul>
        </div>         
        <!-- <div class="filter-group">
          <h2>Genres</h2>
          <ul class="flex">
            <li :class="{ active: selectedGenre === 'All' }" @click="handleActiveGenre('All')"><a>All</a></li>
            <li v-for="genre in genres" 
              :key="genre.id" 
              :class="{ active: selectedGenre === genre.name }" 
              @click="handleFilterOptions({genre: genre.name}); handleActiveGenre(genre.name)"
            >
              <a>{{ genre.name }}</a>
            </li>
          </ul>
        </div>         -->
      </div>
    </div>
    <!-- /sideBar -->

    <div class="container">
      <Movies :movies="moviesToShow" />
    </div>

  </div>    
</template>

<script setup lang="ts">
import Search from '../components/Search.vue';
import Movies from '../components/Movies.vue';
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useStore } from '../store';
import { Movie, OptionsToSort } from "../types";
import { getMovies, searchMovies } from '../services';
import { genres } from '../utils';

const { 
  storedGenre,
  storedGenreID,
  storedMovies,
  storedMoviesFromSearch,
  storedSearchQuery,
  storedShowFilter,
  updateStoredMoviesFromSearch,
  updateStoredMovies, 
  updateStoredGenre, 
  updateStoredGenreID,
  updateStoredShowFilter,
  resetPageNumber, 
  resetMoviesList, 
  incrementPageNumber,
} = useStore();

const sortOptions: OptionsToSort = {
    'popular': 'popularity.desc',
    'topRated': 'vote_count.desc'
};  

const isLoading = ref<boolean>(false);
const showFilter = ref<boolean>(storedShowFilter);
const movies = ref<Movie[]>([]);
const moviesFromSearch = ref<Movie[]>(storedMoviesFromSearch);
const searchQuery = ref<string>(storedSearchQuery);
const selectedGenre = ref<string>(storedGenre);
const selectedGenreID = ref<number | null>(storedGenreID);
const fromRating = ref<string>('');
const toRating = ref<string>('');
const fromYear = ref<number | null>(null);
const toYear = ref<number | null>(null);

const moviesToShow = computed(() => {
  let currentMovies = moviesFromSearch.value.length ? moviesFromSearch.value : movies.value;
  return currentMovies.filter(movie => {
    const fromRatingValue = fromRating.value ? parseFloat(fromRating.value) : 0;
    const toRatingValue = toRating.value ? parseFloat(toRating.value) : 10;
    const fromYearValue = fromYear.value || 1900;
    const toYearValue = toYear.value || 2024;
    return (
      movie.vote_average >= fromRatingValue && 
      movie.vote_average <= toRatingValue &&
      movie.release_year >= fromYearValue &&
      movie.release_year <= toYearValue
    );
  });
});

function handleFilter() {
  showFilter.value = !showFilter.value;
  updateStoredShowFilter(showFilter.value);
}

function updateMovies(newArray: Movie[]) {
  updateStoredMoviesFromSearch(newArray);
  moviesFromSearch.value = newArray;
};

function updateSearchQuery(value: string) {
  searchQuery.value = value;
};

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
    
    if( searchQuery.value.length > 0 ) {
        const data = await searchMovies(searchQuery.value);
        if (data) {
            const arr = [...moviesFromSearch.value, ...data];
            updateMovies(arr)
            isLoading.value = false;
        }      

        return
    }

    let param: string | number | null = null;

    if(selectedGenreID.value !== null){
        param = selectedGenreID.value
    }else{
        param = sortOptions['popular']
    }

    await handleMovies(param);
    isLoading.value = false;
}

async function handleSearch() {
        isLoading.value = true;
        const value = searchQuery.value.toLowerCase();
        updateStoredSearchQuery(value);
        const data = await searchMovies(value);
        if (data) {
            emits('update-movies', data);
            emits('update-query', value);
            isLoading.value = false;
        }
    };

function handleActiveGenre(genre: string) {
  if(genre !== "All") {
    selectedGenre.value = genre;
  }else {
    selectedGenre.value = "All";
  }
  
  updateStoredGenre(genre);
}

async function handleSelectedGenre({genre, genre_id }: {genre: string, genre_id?: number | undefined}) {
    if (selectedGenre.value === genre) return;
    selectedGenre.value = genre;
    selectedGenreID.value = genre_id || null;
    updateStoredGenre(selectedGenre.value);
    updateStoredGenreID(selectedGenreID.value);
    resetPageNumber();
    resetMoviesList();
    movies.value = [];
    isLoading.value = true;
    await handleMovies(genre_id);
    isLoading.value = false;
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

.filter-wrap {
  gap: 10px;
  align-items: center;
}

.side-bar {
    width: 400px;
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

          &.active  {
            color: $gold-color;
            font-weight: bold;
          }

          input {
            all: revert;
            border-radius: 5px;
            outline: none;
            padding: 5px;
          }
        }
      }
    }    
}
</style>