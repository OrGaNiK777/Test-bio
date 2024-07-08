export const headlines = [
	{ header: 'ID фильма', accessorKey: 'id' }, // ID фильма из базы,
	{ header: 'заголовок', accessorKey: 'title' }, // заголовок,
	{ header: 'заголовок на родном языке', accessorKey: 'original_title' }, // заголовок на родном языке,
	{ header: 'коллекция', accessorKey: 'belongs_to_collection' }, // данные о принадлежности фильма к коллекции фильмов,
	{ header: 'бюджет', accessorKey: 'budget' }, // бюджет фильма,
	{ header: 'жанры', accessorKey: 'genres' }, // список жанров фильма,
	{ header: 'страница', accessorKey: 'homepage' }, // страница фильма
	{ header: 'ID IMDB', accessorKey: 'imdb_id' }, // ID фильма в базе IMDB
	{ header: 'язык', accessorKey: 'original_language' }, // язык фильма,
	{ header: 'краткое описание', accessorKey: 'overview' }, // краткое описание,
	{ header: 'популярность', accessorKey: 'popularity' }, // популярность фильма,
	{ header: 'киностудия', accessorKey: 'production_companies' }, // список с информацией по киностудиям,
	{ header: 'страны', accessorKey: 'production_countries' }, //  список с информацией по странам,
	{ header: 'дата выхода', accessorKey: 'release_date' }, // дата выхода,
	{ header: 'доходы', accessorKey: 'revenue' }, // доходы,
	{ header: 'продолжительность', accessorKey: 'runtime' }, // продолжительность,
	{ header: 'языки', accessorKey: 'spoken_languages' }, // список с языками, представленными в фильме,
	{ header: 'статус', accessorKey: 'status' }, // статус выхода фильма,
	{ header: 'изречение', accessorKey: 'tagline' }, // изречение,
	{ header: 'рейтинг', accessorKey: 'vote_average' }, // средний рейтинг,
	{ header: 'голосов рейтинга', accessorKey: 'vote_count' }, // количество голосов рейтинга
	{ header: 'Возрастной рейтинг', accessorKey: 'adult' }, // фильм для взрослых true/false,
]