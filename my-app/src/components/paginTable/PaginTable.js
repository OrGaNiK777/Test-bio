import React, { useEffect, useState } from 'react'

import {
  flexRender,
} from '@tanstack/react-table'

export default function PaginTable({ table }) {
  return (<>
    <table>
      <thead>{table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header) => {
            return (
              <th style={{ cursor: "pointer" }} key={header.id} colSpan={header.colSpan}>
                {header.isPlaceholder ? null : (
                  <>
                    <div
                      {...{
                        className: header.column.getCanSort() ? 'cursor-pointer select-none' : '',
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
                      <div>
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
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => {
                return <td kefy={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
    <div className='h-2' />
    <div className='flex items-center gap-2'>
      <button className='border rounded p-1' onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
        {'<<'}
      </button>
      <button className='border rounded p-1' onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
        {'<'}
      </button>
      <button className='border rounded p-1' onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
        {'>'}
      </button>
      <button className='border rounded p-1' onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
        {'>>'}
      </button>
      <span className='flex items-center gap-1'>
        <div>Page</div>
        <strong>
          {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </strong>
      </span>
      <span className='flex items-center gap-1'>
        | Go to page:
        <input
          type='number'
          defaultValue={table.getState().pagination.pageIndex + 1}
          onChange={(e) => {
            const page = e.target.value ? Number(e.target.value) - 1 : 0
            table.setPageIndex(page)
          }}
          className='border p-1 rounded w-16'
        />
      </span>
      <select
        value={table.getState().pagination.pageSize}
        onChange={(e) => {
          table.setPageSize(Number(e.target.value))
        }}
      >
        {[2, 10, 20, 30, 40, 50].map((pageSize) => (
          <option key={pageSize} value={pageSize}>
            Show {pageSize}
          </option>
        ))}
      </select>
    </div>
    <div>{table.getPrePaginationRowModel().rows.length} Rows</div>
    <pre>{JSON.stringify({ columnFilters: table.getState().columnFilters }, null, 2)}</pre>
  </>
  )
}

function Filter({ column }) {
  const columnFilterValue = column.getFilterValue()
  const { filterVariant } = column.columnDef.meta ?? {}

  return filterVariant === 'range' ? (
    <div>
      <div className='flex space-x-2'>
        {/* See faceted column filters example for min max values functionality */}
        <DebouncedInput type='number' value={(columnFilterValue)?.[0] ?? ''} onChange={(value) => column.setFilterValue((old) => [value, old?.[1]])} placeholder={`Min`} className='w-24 border shadow rounded' />
        <DebouncedInput type='number' value={(columnFilterValue)?.[1] ?? ''} onChange={(value) => column.setFilterValue((old) => [old?.[0], value])} placeholder={`Max`} className='w-24 border shadow rounded' />
      </div>
      <div className='h-1' />
    </div>
  ) : filterVariant === 'select' ? (
    <select onChange={(e) => column.setFilterValue(e.target.value)} value={columnFilterValue?.toString()}>
      {/* See faceted column filters example for dynamic select options */}
      <option value=''>All</option>
      <option value='complicated'>complicated</option>
      <option value='relationship'>relationship</option>
      <option value='single'>single</option>
    </select>
  ) : (
    <DebouncedInput className='w-36 border shadow rounded' onChange={(value) => column.setFilterValue(value)} placeholder={`Search...`} type='text' value={(columnFilterValue ?? '')} />
    // See faceted column filters example for datalist search suggestions
  )
}

// A typical debounced input react component
function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <input {...props} value={value} onChange={(e) => setValue(e.target.value)} />
}

