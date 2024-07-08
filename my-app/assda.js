 // имитирует серверный API
 const fetchData = async (
  start,
  size,
  sorting
) => {
  const dbData = [...data]
  if (sorting.length) {
    const sort = sorting[0]
    const { id, desc } = sort
    dbData.sort((a, b) => {
      if (desc) {
        return a[id] < b[id] ? 1 : -1
      }
      return a[id] > b[id] ? 1 : -1
    })
  }

  // имитируем серверный API
  await new Promise(resolve => setTimeout(resolve, 200))

  return {
    data: dbData.slice(start, start + size),
    meta: {
      totalRowCount: dbData.length,
    },
  }
}