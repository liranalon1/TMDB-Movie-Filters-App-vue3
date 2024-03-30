<template>
  <div class="movie-details flex">
    <div class="container">
      <div class="back">
        <router-link :to="{ path: '/' }">➜</router-link>
      </div>

      <div class="movie-content flex">
        <div class="poster flex">
          <img :src="`https://image.tmdb.org/t/p/original${movie.poster_path}`" v-if="movie?.poster_path" :alt="movie.title">
        </div>

        <div class="inner-content">
          <h1>{{ movie?.title }}</h1>
          <p class="rating"> &#9733; {{ movie?.vote_average }}</p>
          <p class="synopsis">
            <span class="title-s">Synopsis:</span>
            {{ movie?.overview }}
          </p>

          <div class="group flex">
            <p class="duration">{{ movie?.runtime }} min</p>
            <p>{{ movie?.genres.map(genre => genre.name).join(', ') }}</p>
          </div>

          <p class="cast">
            <span class="title-s">Cast:</span>
            {{ movie?.credits.cast.map(actor => actor.name).join(', ') }}
          </p>
          <p class="director">
            <span class="title-s">Director:</span>
            {{ director }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import axios from 'axios';
  import { api_key, base_url } from '../services';
  import { Movie } from '../types'

  const router = useRouter();
  const movieID = ref<string>("");
  const movie = ref<Movie | null>(null);
  const director = ref<string>("");

  async function fetchMovieDetails(id: string) {
    try {
      const response = await axios.get(`${base_url}/movie/${id}`, {
        params: {
          api_key: api_key,
          language: 'en-US',
          append_to_response: 'credits'
        }
      });
      const movieDetails = response.data;
      movieDetails.vote_average = parseFloat(movieDetails.vote_average.toFixed(1));
      return movieDetails;
    } catch (error) {
      console.error('Error fetching movie details:', error);
    }
  }

  onMounted(async () => {
    movieID.value = router.currentRoute.value.params.id as string;
    await handleMovieDetails(movieID.value);
  });

  watch(() => router.currentRoute.value.params.id, async (newValue) => {
    movieID.value = newValue;
    await handleMovieDetails(movieID.value);
  });

  async function handleMovieDetails(movieId: string) {
    const movieDetails = await fetchMovieDetails(movieId);
    movie.value = movieDetails;
    director.value = movieDetails.credits.crew
      .filter((member: { job: string; name: string }) => member.job === 'Director')
      .map((member: { job: string; name: string }) => member.name)
      .join('');
  }
</script>

<style scoped lang="scss">
  @import '../assets/scss/variables.scss';
  
  .movie-details{
    padding: 30px 50px 100px;

    .back {
      width: fit-content;
      font-size: 40px;
      color: $gold-color;
      transform: rotate(-180deg);
    }

    .movie-content {
      
      .poster {
        flex: 1 1 40%;
        align-items: center;
        justify-content: center;
        max-width: 500px;
        box-shadow: 0 8px 20px -4px hsl(0, 0%, 5%);
      }
      .inner-content {
        display: flex;
        flex-direction: column;
        gap: 10px;        
        width: 100%;
        max-width: 60%;
        padding: 60px;
        flex: 1 1 60%;
        
        h1 {
          font-size: 40px;
          font-weight: bold;
        }

        .title-s {
          display: block;
          font-weight: bold;
          text-decoration: underline;
          margin-bottom: 5px;
        }

        .synopsis {
          margin: 15px 0;
        }

        .group {
          gap: 10px;
          align-items: center;
        }

        .duration {
          width: fit-content;
          padding: 5px;
          border-radius: 5px;
          border: 1px solid rgba(255, 255, 255, 0.09);
          background-color: rgba(255, 255, 255, 0.09);
        }

        .rating {
          color: $gold-color;
        }  
      }
    }
  }
</style>
