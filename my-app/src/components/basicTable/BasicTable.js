import React, { useEffect, useMemo, useState } from 'react'
import { useTable } from 'react-table'
import './BasicTable.css'
import { headlines } from "../../constants/headlines"
import { postMovies } from '../../api/api'

function BasicTable() {
  const [movies, setMovies] = useState([]);
  function handleReceivingMovies() {
    postMovies({ page: 1, pageSize: 10 })
      .then((item) => {
        setMovies(item.data)
        console.log(item.data)
      })
      .catch((err) => {
        console.log(err)
      })
      .finally(() => {
      })
  }
  useEffect(() => { handleReceivingMovies() }, [])


  const columns = useMemo(() => headlines, [])
  const data = useMemo(() => movies, [movies])

  const tableInstance = useTable({
    columns,
    data
  })

  const { getTableProps, getTableBodyProps, headerGroups, footerGroups, rows, prepareRow } = tableInstance
  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps()}>
                {column.render('Header')}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map(row => {
          prepareRow(row)
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map((cell) => {
                return <td {...cell.getCellProps()}>
                  {cell.render('Cell')}</td>
              })}
            </tr>
          )
        })
        }
      </tbody>
    </table>
  )
}

export default BasicTable