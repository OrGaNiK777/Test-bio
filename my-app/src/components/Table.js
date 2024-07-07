import React, { useEffect, useMemo, useReducer, useState } from 'react'
import ReactDOM from 'react-dom/client'
import "./Table.css"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingFn,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { postMovies } from '../api/api'
import { headlines } from '../constants/headlines'

//custom sorting logic for one of our enum columns
const sortStatusFn = (rowA, rowB, _columnId) => {
  const statusA = rowA.original.status
  const statusB = rowB.original.status
  const statusOrder = ['single', 'complicated', 'relationship']
  return statusOrder.indexOf(statusA) - statusOrder.indexOf(statusB)
}

function Table() {
  const [movies, setMovies] = useState([])
  function downloadMovies() {
    postMovies({
      page: 1,
      pageSize: 100,
    })
      .then((item) => {
        const items = item.data.map((i) => {
          i.adult ? (i.adult = '18+') : (i.adult = '0+')
          i.belongs_to_collection == null ? (i.belongs_to_collection = '-') : (i.belongs_to_collection = i.belongs_to_collection.name)
          if (i.budget == null) { i.budget = '-' }
          Array.isArray(i.genres) ? (i.genres = i.genres.map((genre) => genre.name).join(', ')) : (i.genres = '-')
          Array.isArray(i.production_companies) ? (i.production_companies = i.production_companies.map((i) => i.name).join(', ')) : (i.production_companies = '-')
          Array.isArray(i.production_countries) ? (i.production_countries = i.production_countries.map((i) => i.name).join(', ')) : (i.production_countries = '-')
          Array.isArray(i.spoken_languages) ? (i.spoken_languages = i.spoken_languages.map((i) => i.name).join(', ')) : (i.spoken_languages = '-')
          return i
        })
        setMovies(items)
        console.log(items)
      })
      .catch((err) => {
        console.log(err)
      })
      .finally(() => { })
  }
  useEffect(() => {
    downloadMovies()
  }, [])
  const columns = useMemo(() => headlines, [])
  const data = useMemo(() => movies, [movies])

  const rerender = useReducer(() => ({}), {})[1]

  const [sorting, setSorting] = useState([])



  const table = useReactTable({
    columns,
    data,
    debugTable: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), //client-side sorting
    onSortingChange: setSorting, //optionally control sorting state in your own scope for easy access
    // sortingFns: {
    //   sortStatusFn, //or provide our custom sorting function globally for all columns to be able to use
    // },
    //no need to pass pageCount or rowCount with client-side pagination as it is calculated automatically
    state: {
      sorting,
    },
    // autoResetPageIndex: false, // turn off page index reset when sorting or filtering - default on/true
    // enableMultiSort: false, //Don't allow shift key to sort multiple columns - default on/true
    // enableSorting: false, // - default on/true
    // enableSortingRemoval: false, //Don't allow - default on/true
    // isMultiSortEvent: (e) => true, //Make all clicks multi-sort - default requires `shift` key
    // maxMultiSortColCount: 3, // only allow 3 columns to be sorted at once - default is Infinity
  })

  //access sorting state from the table instance
  console.log(table.getState().sorting)

  return (
    <div className="p-2">
      <div className="h-2" />
      <table>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                return (
                  <th key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? 'cursor-pointer select-none'
                            : ''
                        }
                        onClick={header.column.getToggleSortingHandler()}
                        title={
                          header.column.getCanSort()
                            ? header.column.getNextSortingOrder() === 'asc'
                              ? 'Sort ascending'
                              : header.column.getNextSortingOrder() === 'desc'
                                ? 'Sort descending'
                                : 'Clear sort'
                            : undefined
                        }
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽',
                        }[header.column.getIsSorted()] ?? null}
                      </div>
                    )}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table
            .getRowModel()
            .rows.slice(0, 2)
            .map(row => {
              
              return (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => {
                    console.log(cell)
                    return (
                      <td key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
        </tbody>
      </table>
      <div>{table.getRowModel().rows.length.toLocaleString()} Rows</div>
      <div>
        <button onClick={() => rerender()}>Force Rerender</button>
      </div>
      {/* <div>
        <button onClick={() => refreshData()}>Refresh Data</button>
      </div> */}
      <pre>{JSON.stringify(sorting, null, 2)}</pre>
    </div>
  )
}

export default Table