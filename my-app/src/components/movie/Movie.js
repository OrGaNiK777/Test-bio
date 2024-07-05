import './Movie.css';

function Movie({ movie }) {
  return (
    <tr><td>{movie.id}</td>
      <td>{movie.title}</td>
      <td>{movie.overview}</td>
      <td>{movie.adult ? "18+" : "18-"}</td>
      <td>{movie.budget}</td>
    </tr>
  );
}

export default Movie;