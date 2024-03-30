<template>
    <div class="results">
        <ul>
            <li v-for="movie in props.results" :key="movie.id">
                <router-link :to="{ name: 'MovieDetails', params: { id: movie.id }}" @click="closeResults">
                    <img v-lazy="movie.poster" width="48">
                    <div class="link-group">
                        <h3 class="title">{{ movie.title }}</h3>
                        <div class="year">{{ movie.release_year }}</div>
                        <div class="rating"> &#9733; {{ movie.vote_average }}</div>
                    </div>
                </router-link>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
    import { Movie } from '../types';

    const props = defineProps({
        results: Array as () => Movie[],
        value: Boolean
    });

    const emits = defineEmits(['closeResults']);

    const closeResults = () => {
        emits('closeResults', false);
    };
</script>

<style lang="scss" scoped>
    @import "../assets/scss/global.scss";
    @import "../assets/scss/variables.scss";
    
    .results{
        position: absolute;
        max-width: 500px;
        width: 100%;
        max-height: 80vh;
        border: 1px solid #1c1e22;
        margin-top: 10px;
        overflow: auto;
        background: rgba(24, 24, 24, 0.95);
        box-shadow: 0 8px 20px -4px hsl(0, 0%, 5%);
        ul{
            display: flex;
            flex-direction: column;
            li{
                padding: 5px 10px;
                font-size: 16px;
                color: $primary-color; 
                
                &:hover {
                    background-color: #202020;                    
                }           

                a {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transition: none;
                    .title {
                        margin-bottom: 5px;
                    }
                    .year {
                        color: #b3b3b3;
                        font-size: 14px;        
                    }

                    .rating {
                        color: $gold-color;
                        font-size: 14px; 
                    }                    
                } 
            }
        }
    }
</style>