import { defineStore } from 'pinia';
import { Movie } from '../types'

export const useStore = defineStore('movies', {
  state: () => ({
    storedMovies: [] as Movie[],
    storedSearchedMovies: [] as Movie[],
    pageNumber: 1 as number,
    selectedDiscover: 'popular' as string,
    storedGenre: 'All' as string,
    storedGenreID: null as number | null,
  }),
  actions: {
    updateStoredMovies(arr: Movie[]) {
      this.storedMovies = arr;
    },

    updateStoredSearchedMovies(arr: Movie[]) {
      this.storedMovies = arr;
    },

    incrementPageNumber() {
      this.pageNumber++;
    },

    resetPageNumber() {
      this.pageNumber = 1;
    },

    resetMoviesList() {
      this.storedMovies = [];
    },

    updateStoredDiscover(str: string) {
      this.selectedDiscover = str;
    },

    updateStoredGenre(str: string) {
      this.storedGenre = str;
    },

    updateStoredGenreID(num: number | null) {
      this.storedGenreID = num;
    },
  }
});
