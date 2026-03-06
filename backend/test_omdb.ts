import dotenv from 'dotenv';
dotenv.config();
import { fetchMovieData } from './src/services/omdb';

async function test() {
    const id = 'tt8500694';
    try {
        console.log(`Testing ID: ${id}`);
        const movie = await fetchMovieData(id);
        console.log('Success:', movie.title);
    } catch (err) {
        console.error('Failed:', err.message);
    }
}

test();
