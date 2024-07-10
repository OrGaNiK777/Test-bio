import React, { useMemo, useReducer, useState } from 'react'
import { keepPreviousData, useQuery, } from '@tanstack/react-query'
import { useReactTable, getCoreRowModel, flexRender, getPaginationRowModel, } from '@tanstack/react-table'
import { postMovies } from '../../api/api'
import Filter from '../Filter/Filter'

function PaginTable({ searchMovieМVis, columns, columnVisibility, setColumnVisibility }) {
  const fetchSize = 50
  let n = 1
  const rerender = useReducer(() => ({}), {})[1]
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [lengthMov, setLengthMov] = useState("-")

  const dataQuery = useQuery({
    queryKey: ['data', pagination],
    queryFn: () => {
      const start = fetchSize * n
      n = n + 1
      
      const fetchedData = postMovies({ pageSize: start })
        .then((item) => {
          const items = item.data.map((i) => {
            i.id = String(i.id)
            i.adult ? (i.adult = '18+') : (i.adult = '0+')
            i.belongs_to_collection == null ? (i.belongs_to_collection = '-') : (i.belongs_to_collection = i.belongs_to_collection.name)
            if (i.budget == null) { i.budget = '-' }
            Array.isArray(i.genres) ? (i.genres = i.genres.map((genre) => genre.name).join(', ')) : (i.genres = '-')
            Array.isArray(i.production_companies) ? (i.production_companies = i.production_companies.map((i) => i.name).join(', ')) : (i.production_companies = '-')
            Array.isArray(i.production_countries) ? (i.production_countries = i.production_countries.map((i) => i.name).join(', ')) : (i.production_countries = '-')
            Array.isArray(i.spoken_languages) ? (i.spoken_languages = i.spoken_languages.map((i) => i.name).join(', ')) : (i.spoken_languages = '-')
            return i

          })

          return {
            rows: items.slice(pagination.pageIndex * pagination.pageSize, (pagination.pageIndex + 1) * pagination.pageSize),
            pageCount: Math.ceil(item.data_size / pagination.pageSize),
            rowCount: item.data_size,
          }

        })
        .catch((err) => {
          console.log(err)
        })
      return fetchedData
    }
    ,
    placeholderData: keepPreviousData, // при смене страниц не отображаются 0 строк /загрузка следующей страницы
  })
  console.log(n)
console.log(dataQuery.data)
  const defaultData = useMemo(() => [], [])

  const table = useReactTable({
    data: dataQuery.data?.rows ?? defaultData,
    columns,
    pageCount: dataQuery.data?.pageCount ?? -1, //теперь вы можете указать "rowCount" вместо "pageCount", и "pageCount" будет вычисляться внутри системы (новое в версии 8.13.0)
    //rowCount: dataQuery.data?.rowCount, // новое в версии 8.13.0 - в качестве альтернативы, просто введите "pageCount` напрямую
    state: {
      pagination
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true, //мы выполняем разбивку страниц вручную "на стороне сервера"
    //getPaginationRowModel: getPaginationRowModel(), // Если вы выполняете разбивку на страницы только вручную, вам это не нужно
    debugTable: true,
  })
  return (
    <div className="p-2">
      <div className="h-2" />
      <table style={{ display: 'grid' }}>
        <thead style={{
          display: 'grid',
          position: 'sticky',
          top: 68,
          zIndex: 0,
          backgroundColor: '#bbebca',
          height: "75px"
        }}>{table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} style={{ display: 'flex', width: '100%' }}>
            {headerGroup.headers.map((header) => {
              return (
                <th key={header.id}
                  colSpan={header.colSpan}
                  style={{
                    cursor: "pointer",
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: "space-around",
                    width: header.getSize(),
                  }}>
                  {header.isPlaceholder ? null : (
                    <>
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? 'cursor-pointer select-none'
                            : '',
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽',
                        }[header.column.getIsSorted()] ?? null}
                      </div>
                      {header.column.getCanFilter() ? (
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          width: (header.getSize() - 10),
                          marginLeft: "5px"
                        }} >
                          <Filter column={header.column} />
                        </div>
                      ) : null}
                    </>
                  )}
                </th>
              )
            })}
          </tr>
        ))}</thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            return (
              <tr key={row.id}
                style={{
                  display: 'flex',
                  width: '100%',
                }}>
                {row.getVisibleCells().map((cell) => {
                  return (
                    <td
                      key={cell.id}
                      style={{
                        height: "150px",
                        display: 'flex',
                        width: cell.column.getSize(),
                      }}
                    ><div className='scrollable'>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="h-2" />
      <div className="flex items-center gap-2">
        <button
          className="border rounded p-1"
          onClick={() => table.firstPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<<'}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<'}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {'>'}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => { table.lastPage(); }}
          disabled={!table.getCanNextPage()}
        >
          {'>>'}
        </button>
        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount().toLocaleString()}
          </strong>
        </span>
        <span className="flex items-center gap-1">
          | Go to page:
          <input
            type="number"
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={e => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0
              table.setPageIndex(page)
            }}
            className="border p-1 rounded w-16"
          />
        </span>
        <select
          value={table.getState().pagination.pageSize}
          onChange={e => {
            table.setPageSize(Number(e.target.value))
          }}
        >
          {[10, 20, 30, 40, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
        {dataQuery.isFetching ? 'Loading...' : null}
      </div>
      <div>
        Showing {table.getRowModel().rows.length.toLocaleString()} of{' '}
        {dataQuery.data?.rowCount.toLocaleString()} Rows
      </div>
      <div>
        <button onClick={() => rerender()}>Force Rerender</button>
      </div>
      <pre>{JSON.stringify(pagination, null, 2)}</pre>
    </div>
  )
}
export default PaginTable