<template>
    <div class="cards" v-if="movies?.length">
        <div v-for="movie in props.movies" :key="movie.id">
          <div class="card">
            <router-link :to="{ name: 'MovieDetails', params: { id: movie.id }}">
              <div class="poster"> 
                <img v-lazy="movie.poster" :alt="movie.title">
              </div>
              <div class="card-content">
                <h4 class="text-elipsis">{{ movie.title }}</h4>
                <p>{{ movie.release_year }}</p>
                <p>{{ movie.genres.map(((i: string) => i)).join(', ') }}</p>
                <p class="rating"> &#9733; {{ movie.vote_average }}</p>              
              </div>
            </router-link>
          </div>
        </div>
    </div>
    <div class="no-movies" v-else>
        <p>No movies found.</p>
    </div>     
</template>
  
<script setup lang="ts">
    import { Movie } from '../types';
    
    const props = defineProps({
        movies: Array as () => Movie[],
    })  
</script>

<style lang="scss" scoped>
    @import '../assets/scss/variables.scss';

    .cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        grid-gap: 20px;
        align-items: stretch; 
        margin-top: 30px;

        .card {
            height: 100%;
            border-radius: 5px;
            padding: 15px;
            overflow: hidden;
            background-color: #181818;
            transition: background-color 0.4s;
            cursor: pointer;

            &:hover {
                transform: scale(1.02);
                background-color: #202020;
            } 
            
            & > a {
                display: block;
                height: 100%;                
            }
            
            .poster {
                position: relative;
                width: 100%;
                margin-bottom: 18px;   
                
                img {
                    display: block;
                    width: 100%;
                    box-shadow: 0 8px 20px -4px hsl(0deg, 0%, 5%);
                }         
            }

            .card-content {
                p {
                    color: #b3b3b3;
                    margin-top: 5px;
                    font-size: 14px;                
                }

                .rating {
                    color: $gold-color;
                }
            }
        }
    }

    .no-movies {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 200px;
        font-size: 28px;        
    }
</style>
  