import { defineStore } from 'pinia';
import { Movie } from '../types'

export const useStore = defineStore('movies', {
  state: () => ({
    storedMovies: [] as Movie[],
    storedMoviesFromSearch: [] as Movie[],
    storedSearchQuery: '' as string,
    pageNumber: 1 as number,
    storedGenre: '' as string,
    storedGenreID: null as number | null,
    storedShowFilter: false as boolean,
  }),
  actions: {
    updateStoredMovies(arr: Movie[]) {
      this.storedMovies = arr;
    },

    updateStoredMoviesFromSearch(arr: Movie[]) {
      this.storedMoviesFromSearch = arr;
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

    updateStoredGenre(str: string) {
      this.storedGenre = str;
    },

    updateStoredSearchQuery(str: string) {
      this.storedSearchQuery = str;
    },

    updateStoredGenreID(num: number | null) {
      this.storedGenreID = num;
    },

    updateStoredShowFilter(bool: boolean) {
      this.storedShowFilter = bool;
    },
  }
});
