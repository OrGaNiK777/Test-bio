export const headlines = [
  {header: "ID фильма", accessor: "id", id: 1, view: true }, // ID фильма из базы,
  {header: "заголовок", accessor: "title", id: 2, view: true }, // заголовок,
  {header: "заголовок на родном языке", accessor: "original_title", id: 3, view: true }, // заголовок на родном языке,
  {header: "коллекция", accessor: "belongs_to_collection", id: 4, view: true }, // данные о принадлежности фильма к коллекции фильмов,
  {header: "бюджет", accessor: "budget", id: 5, view: true }, // бюджет фильма,
  {header: "жанры", accessor: "genres", id: 6, view: true }, // список жанров фильма,
  {header: "страница", accessor: "homepage", id: 7, view: true }, // страница фильма
  {header: "ID IMDB", accessor: "imdb_id", id: 8, view: true }, // ID фильма в базе IMDB
  {header: "язык", accessor: "original_language", id: 9, view: true }, // язык фильма,
  {header: "краткое описание", accessor: "overview", id: 10, view: true }, // краткое описание,
  {header: "популярность", accessor: "popularity", id: 11, view: true }, // популярность фильма,
  {header: "киностудия", accessor: "production_companies", id: 12, view: true }, // список с информацией по киностудиям,
  {header: "страны", accessor: "production_countries", id: 13, view: true }, //  список с информацией по странам,
  {header: "дата выхода", accessor: "release_date", id: 14, view: true }, // дата выхода,
  {header: "доходы", accessor: "revenue", id: 15, view: true }, // доходы,
  {header: "продолжительность", accessor: "runtime", id: 16, view: true }, // продолжительность,
  {header: "языки", accessor: "spoken_languages", id: 17, view: true }, // список с языками, представленными в фильме,
  {header: "статус", accessor: "status", id: 18, view: true }, // статус выхода фильма,
  {header: "изречение", accessor: "tagline", id: 19, view: true }, // изречение,
  {header: "рейтинг", accessor: "vote_average", id: 20, view: true }, // средний рейтинг,
  {header: "голосов рейтинга", accessor: "vote_count", id: 21, view: true }, // количество голосов рейтинга
  {header: "Возрастной рейтинг", accessor: "adult", id: 22, view: true} // фильм для взрослых true/false,
]