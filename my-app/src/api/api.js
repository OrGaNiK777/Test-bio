const url = "http://185.185.69.80:8082"
const headers = {
  "Content-Type": "application/json"
}

// обработка результата ответа сервера
export const checkingResponse = (res) => {
  if (res.ok) {
    return res.json();
  }
  // если ошибка, отклоняем промис
  return Promise.reject(`Ошибка: ${res.status}`);
}

export const postMovies = async (data) => {
  const res = await fetch(`${url}/list`, {
    method: "post",
    headers: headers,
    body: JSON.stringify({
      page: data.page, // номер страницы, начиная счёт с 0, по умолчанию 0,
      page_size: data.pageSize, // число записей на странице,
      //sort_field: data.sortField, // по какому полю сортировать: "", imdb_id, budget, original_language, popularity, release_date, revenue, runtime, status, vote_average или vote_count,
      // sort_order: "", // направление сортировки: "", // asc или desc, по умолчанию asc,
      // imdb_id: "", // ID фильма для поиска только одного фильма,
      // ids: "", // массив чисел ID из базы,
      search: data.search, // строка поиска по фразе,
      // adult: "", // фильм для взрослых true/false,
      // budget_min: "", // целое число,
      // budget_max: "", // целое число,
      // genres: "", // массив строк с жанрами фильмов,
      // original_language: "", // строка с названием языка, например fr,
      // popularity_min: "", // число с плавающей точкой,
      // popularity_max: "", // число с плавающей точкой,
      // release_date_min: "", // дата в формате YYYY-MM-DD,
      // release_date_max: "", // дата в формате YYYY-MM-DD,
      // revenue_min: "", // целое число,
      // revenue_max: "", // целое число,
      // runtime_min: "", // число с плавающей точкой,
      // runtime_max: "", // число с плавающей точкой,
      // spoken_languages: "", // массив строк с названиями языков,
      // status: "", // статус выхода фильма,
      // vote_average_min: "", // число с плавающей точкой,
      // vote_average_max: "", // число с плавающей точкой,
      // vote_count_min: "", // целое число,
      // vote_count_max: "" // целое число
    }),
  });
  return checkingResponse(res);
}