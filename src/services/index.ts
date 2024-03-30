import axios from 'axios';
import { useStore } from '../store';
import { genres } from "../utils";
import { Movie, Params } from '../types';

const base_url = `https://api.themoviedb.org/3`
const api_key = `d864cf7ce8d10bafbbd04cd1c5a5ac00`

async function getMovies(sort_by: string | number) {
    const { pageNumber } = useStore();

    const params: Params = {
      api_key: api_key,
      language: "en-US",
      page: pageNumber
    };

    if (typeof sort_by === 'number') {
      params.with_genres = sort_by;
    } else {
      params.sort_by = sort_by;
    }

    try {
      const response = await axios.get(`${base_url}/discover/movie`, {params});
      const moviesWithGenres = await response.data.results.map((movie: Movie) => {
        const genresList = movie.genre_ids.map((id: number) => {
          const genre = genres.find((genre) => genre.id === id);
          return genre ? genre.name : '';
        });
        return {
          id: movie.id,
          title: movie.title,
          release_year: parseInt(movie.release_date.substring(0, 4)) || "Unknown year",
          genres: genresList,
          vote_average: parseFloat(movie.vote_average.toFixed(1)),
          overview: movie.overview,
          cast: [],
          director: '',
          poster: `https://image.tmdb.org/t/p/w370_and_h556_bestv2${movie.poster_path}`
        };
      });
      
      return moviesWithGenres;
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
}

async function searchMovies(query: string) {
    try {
        const response = await axios.get(`${base_url}/search/movie`, {
          params: {
              api_key: api_key,
              language: "en-US",
              query: query,
              include_adult: false,
              page: 1
          }
        });
        
        const  data = response.data.results.map((movie: Movie) => ({
            id: movie.id,
            title: movie.title,
            poster: `https://image.tmdb.org/t/p/original${movie.poster_path}`,
            release_year: parseInt(movie.release_date?.substring(0, 4)),
            vote_average: parseFloat(movie.vote_average.toFixed(1)),
        }));

        return data;
    } catch (error) {
        console.error('Error searching movies:', error);
    }
}

export {api_key, base_url, getMovies, searchMovies}