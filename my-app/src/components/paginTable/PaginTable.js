import React, { useEffect, useMemo, useReducer, useState } from 'react'
import { keepPreviousData, useQuery, } from '@tanstack/react-query'
import { useReactTable, getCoreRowModel, flexRender, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, } from '@tanstack/react-table'
import { postMovies } from '../../api/api'
import Filter from '../Filter/Filter'

function PaginTable({ searchMovieМVis, columns, columnVisibility, setColumnVisibility, inputSearchMovie }) {
  const [lengthAllMovies, setLengthAllMovies] = useState(1)
  const [data, setData] = useState([])

  useEffect(() => {
    downMovies(500);
    setTimeout(() => { downMovies(45433) }, 1000)
  }, [])


  function downMovies(pageSize) {
    postMovies({ pageSize: pageSize })
      .then((item) => {
        setLengthAllMovies(item.data_size)
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
        setData(items)
      })
      .catch((err) => {
        console.log(err)
      })
  }
  return (
    <>
      <MyTable
        {...{
          data: (inputSearchMovie.length === 0 || searchMovieМVis.length === 0) ? data : searchMovieМVis,
          columns,
          lengthAllMovies,
          searchMovieМVis,
          columnVisibility,
          setColumnVisibility
        }}
      />
    </>
  )
}

function MyTable({
  data,
  columns,
  lengthAllMovies,
  searchMovieМVis,
  columnVisibility,
  setColumnVisibility
}) {
  const [sorting, setSorting] = useState([])
  const [checkPageSize, setCheckPageSize] = useState(10)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const table = useReactTable({
    columns,
    data,
    debugTable: true,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    //no need to pass pageCount or rowCount with client-side pagination as it is calculated automatically
    state: {
      pagination,
      sorting,
      columnVisibility,
    },
    manualSorting: false,
    // autoResetPageIndex: false, // turn off page index reset when sorting or filtering
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
          onClick={() => table.lastPage()}
          disabled={!table.getCanNextPage()}
        >
          {'>>'}
        </button>
        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{' '}
            {Math.ceil(((searchMovieМVis.length === 0) ? lengthAllMovies : searchMovieМVis.length / checkPageSize)).toLocaleString()}
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
            setCheckPageSize(Number(e.target.value))
            table.setPageSize(Number(e.target.value))
          }}
        >
          {[10, 20, 30, 40, 50].map(pageSize => {

            return <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          })}
        </select>
      </div>
      <div>
        Showing {table.getRowModel().rows.length.toLocaleString()} of{' '}
        {((searchMovieМVis.length === 0) ? lengthAllMovies : searchMovieМVis.length).toLocaleString()} Rows
      </div>
    </div>
  )
}

export default PaginTable