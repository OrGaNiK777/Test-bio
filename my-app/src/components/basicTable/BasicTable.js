import React, { useEffect, useMemo, useState } from 'react'
import { useFilters, usePagination, useSortBy, useTable } from 'react-table'
import { BiSortAlt2, BiSortDown, BiSortUp } from 'react-icons/bi'
import { FaSearch } from 'react-icons/fa'
import './BasicTable.css'
import { headlines } from '../../constants/headlines'
import { postMovies } from '../../api/api'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

function BasicTable() {
	const defaultColumn = useMemo(
		() => ({
			Filter: DefaultColumnFilter
		}),
		[]
	);
	function DefaultColumnFilter({
		column: { filterValue, preFilteredRows, setFilter }
	}) {
		const count = preFilteredRows.length;
		return (
			<input
				value={filterValue || ""}
				onChange={(e) => {
					setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
				}}
				placeholder={`фильтрация по полю`}
			/>
		);
	}
	const filterTypes = useMemo(
		() => ({
			text: (rows, id, filterValue) => {
				return rows.filter((row) => {
					const rowValue = row.values[id];
					return rowValue !== undefined
						? String(rowValue)
							.toLowerCase()
							.startsWith(String(filterValue).toLowerCase())
						: true;
				});
			}
		}),
		[]
	);

	const [displayedPages, setDisplayedPages] = useState(true)

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
	}, [setDisplayedPages])

	const columns = useMemo(() => headlines, [])
	const data = useMemo(() => movies, [movies])

	const [columnVisibility, setColumnVisibility] = useState({})

	const table = useReactTable({
		data,
		columns,
		state: {
			columnVisibility,
		},
		onColumnVisibilityChange: setColumnVisibility,
		getCoreRowModel: getCoreRowModel(),
		debugTable: true,
		debugHeaders: true,
		debugColumns: true,
	})

	const {
		getTableProps,
		getTableBodyProps,
		headerGroups,
		prepareRow,
		rows,
		page,
		canPreviousPage,
		canNextPage,
		pageCount,
		gotoPage,
		nextPage,
		previousPage,
		setPageSize,
		state: { pageIndex, pageSize }
	} = useTable(
		{
			columns,
			data,
			initialState: { pageSize: 2 },
			defaultColumn,
			filterTypes
		},
		useFilters,
		useSortBy,
		usePagination
	)


	const [searchMovie, setSearchMovie] = useState('')

	function search(phrase) {
		postMovies({ search: phrase })
			.then((item) => {
				setMovies(item.data)
				console.log(item.data)
			})
			.catch((err) => {
				console.log(err)
			})
			.finally(() => { })
	}

	const onFormSubmit = (e) => {
		e.preventDefault()
		search(searchMovie)
	}

	return (
		<>
			<nav className="one">
				<ul className="topmenu">
					<li><a href="#">View<i className="fa fa-angle-down"></i></a>
						<ul className="submenu">
							{table.getAllLeafColumns().map((column) => {
								return (
									<label>
										<input
											{...{
												type: 'checkbox',
												checked: column.getIsVisible(),
												onChange: column.getToggleVisibilityHandler(),
											}}
										/>{' '}
										{column.columnDef.header}
									</label>
								)
							})
							}
						</ul>
					</li>
				</ul >
			</nav >
			<div>
				<form className='d1' onSubmit={onFormSubmit}>
					<input placeholder='поиска фильмов по фразе' value={searchMovie} onChange={(e) => setSearchMovie(e.target.value)}></input>
					<button type='submit'>{<FaSearch />}</button>
				</form>
			</div>
			<button className='paginationBtn' onClick={() => { setDisplayedPages(!displayedPages) }}>{displayedPages ? "Pagination" : "All"}</button>
			<table {...getTableProps()}>
				<thead>
					{table.getHeaderGroups().map(headerGroup => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map(header => {
								console.log(headerGroup)
								return <th key={header.id} colSpan={header.colSpan}>
									{header.isPlaceholder
										? null
										: flexRender(
											header.column.columnDef.header,
											header.getContext()
										)
									}
								</th>
							})}
						</tr>
					))}
					{headerGroups.map((headerGroup) => {
						return (
							<tr {...headerGroup.getHeaderGroupProps()}>
								{
									headerGroup.headers.map((column) => {
										console.log(column.canFilter)
										return <th>
											<div>{column.canFilter ? column.render("Filter") : null}</div>
											<span span  {...column.getHeaderProps(column.getSortByToggleProps())} > {column.isSorted ? column.isSortedDesc ? <BiSortUp /> : <BiSortDown /> : <BiSortAlt2 />}</span>
											<button onClick={() => { console.log(column.view); column.view = false }}>Х</button>
										</th>
									})
								}
							</tr >)
					})
					}


				</thead >
				<tbody {...getTableBodyProps()}>
					{(displayedPages ? page : rows).map((row) => {
						prepareRow(row)
						return (
							<tr {...row.getRowProps()}>
								{row.cells.map((cell) => {
									return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
								})}
							</tr>
						)
					})}
				</tbody>
			</table >
			{
				displayedPages ?
					<div className="pagination">
						< button onClick={() => gotoPage(0)
						} disabled={!canPreviousPage}>
							{"<<"}
						</ button > {" "}
						< button onClick={() => previousPage()} disabled={!canPreviousPage}>
							{"<"}
						</button > {" "}
						< button onClick={() => nextPage()} disabled={!canNextPage}>
							{">"}
						</button > {" "}
						< button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
							{">>"}
						</button > {" "}
						< span >
							Page{" "}
							<strong>
								{pageIndex + 1} of {pageCount}
							</strong>{" "}
						</span >
						<span>
							| Go to page:{" "}
							<input
								type="number"
								defaultValue={pageIndex + 1}
								onChange={(e) => {
									const page = e.target.value ? Number(e.target.value) - 1 : 0;
									gotoPage(page);
								}}
								style={{ width: "100px" }}
							/>
						</span>{" "}
						<select
							value={pageSize}
							onChange={(e) => {
								setPageSize(Number(e.target.value));
							}}
						>
							{[2, 10, 20, 30, 40, 50].map((pageSize) => (
								<option key={pageSize} value={pageSize}>
									Show {pageSize}
								</option>
							))}
						</select>
					</div > : <>
					</>
			}
		</>
	)
}

export default BasicTable
