// import { useState } from 'react';
// import './Movies.css';
// import { postMovies } from '../../api/api';
// import Movie from '../movie/Movie';



// function Movies() {

//   const [movies, setMovies] = useState([]);

//   function handleReceivingMovies() {
//     postMovies({ search: "Hound" })
//       .then((item) => {
//         setMovies(item.data)
//         console.log(item.data)
//       })
//       .catch((err) => {
//         console.log(err)
//       })
//       .finally(() => {
//       })
//   }

//   const [searchMovie, setSearchMovie] = useState("");

//   function search(phrase) {
//     postMovies({ search: phrase })
//       .then((item) => {
//         setMovies(item.data)
//         console.log(item.data)
//       })
//       .catch((err) => {
//         console.log(err)
//       })
//       .finally(() => {
//       })
//   }

//   const onFormSubmit = e => {
//     e.preventDefault();
//     search(searchMovie)
//   }

//   function sort(i) {
//     postMovies({ sortField: i })
//       .then((item) => {
//         setMovies(item.data)
//         console.log(item.data)
//       })
//       .catch((err) => {
//         console.log(err)
//       })
//       .finally(() => {
//       })
//   }


//   return (
//     <div className="movies">
//       <form onSubmit={onFormSubmit}>
//         <input placeholder='поиска фильмов по фразе' value={searchMovie} onChange={e => setSearchMovie(e.target.value)}></input>
//         <input type="submit"></input>
//       </form>
//       <button onClick={handleReceivingMovies}>Кнопка</button>
//       <table>
//         <tbody>
//           <tr>
//             <th className='headingTable' onClick={() => sort(123)}>ID фильма из базы</th>
//             <th className='headingTable' onClick={() => sort(123)}>Название</th>
//             <th className='headingTable' onClick={() => sort(123)}>краткое описание</th>
//             <th className='headingTable' onClick={() => sort(123)}>фильм для взрослых</th>
//             <th className='headingTable' onClick={() => sort("budget")}>бюджет фильма</th></tr>
//           {movies.map((movie) => (
//             <Movie key={movie.id} movie={movie} ></Movie>
//           ))}
//         </tbody>
//       </table>
//     </div >
//   );
// }

// export default Movies;
