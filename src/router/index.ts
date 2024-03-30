import { createRouter, createWebHistory } from 'vue-router';
import Home from '../components/Home.vue';
import MovieDetails from '../components/MovieDetails.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/movie/:id', component: MovieDetails, name: 'MovieDetails' },
  ]
});
