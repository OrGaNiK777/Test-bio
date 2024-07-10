import React, { useEffect, useState } from 'react'
import { flexRender } from '@tanstack/react-table'
import Filter from '../Filter/Filter'

export default function PaginTable({ table}) {
  return (<>
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
  </>
  )
}