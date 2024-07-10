export const headlines = [
	{ header: 'ID фильма', accessorKey: 'id', size: 70 }, // ID фильма из базы,
	{ header: 'заголовок', accessorKey: 'title', size: 120 }, // заголовок,
	{ header: 'заголовок на родном языке', accessorKey: 'original_title', size: 120 }, // заголовок на родном языке,
	{ header: 'коллекция', accessorKey: 'belongs_to_collection', size: 100 }, // данные о принадлежности фильма к коллекции фильмов,
	{ header: 'бюджет', accessorKey: 'budget', size: 100 }, // бюджет фильма,
	{ header: 'жанры', accessorKey: 'genres', size: 100 }, // список жанров фильма,
	{ header: 'страница', accessorKey: 'homepage', size: 200 }, // страница фильма
	{ header: 'ID IMDB', accessorKey: 'imdb_id', size: 100 }, // ID фильма в базе IMDB
	{ header: 'язык', accessorKey: 'original_language', size: 100 }, // язык фильма,
	{ header: 'краткое описание', accessorKey: 'overview', size: 300}, // краткое описание,
	{ header: 'популярность', accessorKey: 'popularity', size: 100 }, // популярность фильма,
	{ header: 'киностудия', accessorKey: 'production_companies', size: 120 }, // список с информацией по киностудиям,
	{ header: 'страны', accessorKey: 'production_countries', size: 100 }, //  список с информацией по странам,
	{ header: 'дата выхода', accessorKey: 'release_date', size: 100 }, // дата выхода,
	{ header: 'доходы', accessorKey: 'revenue', size: 100 }, // доходы,
	{ header: 'продолжительность', accessorKey: 'runtime', size: 145 }, // продолжительность,
	{ header: 'языки', accessorKey: 'spoken_languages', size: 100 }, // список с языками, представленными в фильме,
	{ header: 'статус', accessorKey: 'status', size: 100 }, // статус выхода фильма,
	{ header: 'изречение', accessorKey: 'tagline', size: 100 }, // изречение,
	{ header: 'рейтинг', accessorKey: 'vote_average', size: 100 }, // средний рейтинг,
	{ header: 'голосов рейтинга', accessorKey: 'vote_count', size: 100 }, // количество голосов рейтинга
	{ header: 'Возрастной рейтинг', accessorKey: 'adult', size: 100 }, // фильм для взрослых true/false
]