<template>
  <div v-if="isLoading" class="loader"></div>
  <div class="main-wrap flex">

<!-- sideBar -->
<div class="side-bar" v-if="showFilter">
      <div class="filter-wrap" v-if="genres.length">
        <button class="close-filter" @click="toggleShowFilter">X</button>
        <h2>Search filters</h2>
        
        <div class="filter-inner flex">
          <div class="filter-group">
            <h3>Rating</h3>
            <ul class="flex">
              <li class="rating-box">
                <input type="number" class="from" value="" placeholder="e.g. 1.0" step="0.1" min="1" max="10" v-model="fromRating">
                to
                <input type="number" class="to" value="" placeholder="e.g. 10.0" step="0.1" min="1" max="10" v-model="toRating">
              </li>
            </ul>
          </div>
          <div class="filter-group">
            <h3>Release Year</h3>
            <ul class="flex">
              <li class="year-box">
                <input type="number" class="from" value="" placeholder="e.g. 2000" min="1900" max="2024" v-model="fromYear">
                to
                <input type="number" class="to" value="" placeholder="e.g. 2024" min="1900" max="2024" v-model="toYear">
              </li>
            </ul>
          </div>         
          <div class="filter-group">
            <h3>Genres</h3>
            <ul class="flex">
              <li :class="{ active: selectedGenre === '' }" @click="handleActiveGenre('')"><a>All</a></li>
              <li v-for="genre in genres" 
                :key="genre.id" 
                :class="{ active: selectedGenre === genre.name }" 
                @click="handleActiveGenre(genre.name)"
              >
                <a>{{ genre.name }}</a>
              </li>
            </ul>
          </div>        
        </div>

      </div>
    </div>
    <!-- /sideBar -->

    <div class="container">
      <Movies :movies="moviesToShow" />
    </div>

  </div>    
</template>

<script setup lang="ts">
import Movies from '../components/Movies.vue';
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useStore } from '../store';
import { Movie, OptionsToSort } from "../types";
import { getMovies, searchMovies } from '../services';
import { genres } from '../utils';
import { debounce } from '../utils'

const { 
  storedGenre,
  storedGenreID,
  storedMovies,
  storedMoviesFromSearch,
  updateStoredMoviesFromSearch,
  updateStoredMovies, 
  updateStoredGenre, 
  incrementPageNumber,
  resetPageNumber,
  toggleShowFilter,
} = useStore();

const userStore = useStore()
const { storedSearchQuery, storedShowFilter } = storeToRefs(userStore)
const callDebounce = debounce(loadMore, 500);

watch(storedSearchQuery, (newVal) => {
  const query = newVal.toLowerCase();
  searchQuery.value = query;
  handleSearch();
});

watch(storedShowFilter, (newVal) => {
  showFilter.value = newVal;
});

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
  const fromRatingValue = fromRating.value ? parseFloat(fromRating.value) : 0;
  const toRatingValue = toRating.value ? parseFloat(toRating.value) : 10;
  const fromYearValue = fromYear.value || 1900;
  const toYearValue = toYear.value || 2024;
  const genreVal = selectedGenre.value || "";

  const filterCondition = (movie: Movie) => (
    (genreVal === "" || movie.genres.includes(genreVal)) &&
    movie.vote_average >= fromRatingValue &&
    movie.vote_average <= toRatingValue &&
    movie.release_year >= fromYearValue &&
    movie.release_year <= toYearValue
  );

  const uniqueMovieTitles = new Set();
  const filteredMovies = (moviesFromSearch.value.length
    ? moviesFromSearch.value
    : movies.value
  ).filter((movie) => {
    if (!uniqueMovieTitles.has(movie.title)) {
      uniqueMovieTitles.add(movie.title);
      return filterCondition(movie);
    }
    return false;
  });

  return filteredMovies;
});

function updateMovies(newArray: Movie[]) {
  updateStoredGenre("");  
  selectedGenre.value = "";
  updateStoredMoviesFromSearch(newArray);
  moviesFromSearch.value = newArray;
};

async function handleMovies(sort_by: string | number) {
    const data = await getMovies(sort_by);
    if (data) {
        const list = [...movies.value, ...data];
        updateStoredMovies(list);
        movies.value = list; 
    }
}

async function handleSearch() {
    isLoading.value = true;
    moviesFromSearch.value = [];
    updateStoredMoviesFromSearch([]);
    resetPageNumber();
    const data = await searchMovies(searchQuery.value);
    if (data) {
      updateStoredMoviesFromSearch(data);
      moviesFromSearch.value = data;
      isLoading.value = false;
    }
};

async function loadMore() {
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

function handleActiveGenre(genre: string) {
  window.scrollTo(0, 0);  // prevent from load more movies when window scrolling

  if(genre !== "") {
    selectedGenre.value = genre;
  }else {
    selectedGenre.value = "";
  }
  
  updateStoredGenre(genre); 
}

function handleScroll() {
    const bottomOffset = 20;
    const bottomPage = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - bottomOffset;
    if (bottomPage) {
      isLoading.value = true;
      callDebounce();
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
  position: relative;
  width: 400px;
  padding: 20px;

    .filter-wrap {
      position: sticky;
      top: 90px;
      margin-top: 10px;

      .close-filter {
        position: absolute;
        right: 5px;
        top: 5px;
      }

      h2 {
        font-size: 22px;
        font-weight: bold;
        margin-bottom: 10px;    
      }

      .filter-inner {
        flex-direction: column;
        gap: 30px;
        overflow-y: auto;
        overflow-x: hidden;
        max-height: 74vh;
        margin-top: 30px;
      }

      h3 {
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