export interface Movie {
    genre_ids: Genre;
    id: number;
    title: string;
    poster_path: string;
    poster: string;
    overview: string;
    runtime: number;
    release_year: number;
    release_date: string;
    genres: string[];
    vote_average: number;
    credits: {
        cast: { name: string }[];
        crew: { job: string; name: string }[];
    }
}

export interface Params {
    api_key: string;
    language?: string;
    sort_by?: string;
    with_genres?: number;
    page: number;
}

export interface Genre {
    id: number;
    name: string;
}

export type OptionsToSort = {
    [key: string]: string;
};

export type TitleOptions = {
    [key: string]: string;
};