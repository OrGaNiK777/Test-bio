import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { keepPreviousData, useInfiniteQuery, } from 'react-query'
import { useVirtualizer } from 'react-virtual'
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable, getFilteredRowModel, getPaginationRowModel, } from '/react-table'
import './App.css'
import { postMovies } from '../api/api'
import { headlines } from '../constants/headlines'
import { FaSearch } from 'react-icons/fa'

export default function App() {

	const [movies, setMovies] = useState([])
	function downloadMovies() {
		postMovies({
			page: 1,
			pageSize: 30,
		})
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

	const [columnFilters, setColumnFilters] = useState([])
	const rerender = useReducer(() => ({}), {})[1]

	const table = useReactTable({
		data: flatData,
		columns,
		filterFns: {},
		state: {
			columnFilters,
			sorting,
		},
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(), //client side filtering
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		debugTable: true,
		debugHeaders: true,
		debugColumns: false,
		manualSorting: true,
	})
	const [displayedPages, setDisplayedPages] = useState(true)

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
	//бесконечная прокрутка


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

	function visMovies(start, size, sorting) {
		postMovies({
			pageSize: start
		})
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
				setMovies(items)
				console.log(items)
			})
			.catch((err) => {
				console.log(err)
			})
			.finally(() => { })
	}

	const tableContainerRef = useRef(null)

	const [sorting, setSorting] = useState([])

	const fetchSize = 3

	//react-query имеет хук useInfiniteQuery, который идеально подходит для этого варианта использования
	const { data1, fetchNextPage, isFetching, isLoading } =
		useInfiniteQuery({
			queryKey: [
				'people',
				sorting, //вызов при сортировке изменений
			],
			queryFn: async ({ pageParam = 0 }) => {
				const start = (pageParam) * fetchSize
				const fetchedData = await fetchData(start, fetchSize, sorting) //симулируем вызов API
				return fetchedData
			},
			initialPageParam: 0,
			getNextPageParam: (_lastGroup, groups) => groups.length,
			refetchOnWindowFocus: false,
			placeholderData: keepPreviousData,
		})

	//сглаживаем массив массивов из хука useInfiniteQuery
	const flatData = React.useMemo(
		() => data?.pages?.flatMap(page => page.data) ?? [],
		[data]
	)
	const totalDBRowCount = data?.pages?.[0]?.meta?.totalRowCount ?? 0
	const totalFetched = flatData.length

	//вызывается при прокрутке и, возможно, при монтировании, чтобы получить больше данных, когда пользователь прокручивает и достигает нижней части таблицы
	const fetchMoreOnBottomReached = useCallback(
		(containerRefElement) => {
			if (containerRefElement) {
				const { scrollHeight, scrollTop, clientHeight } = containerRefElement
				//как только пользователь прокрутит таблицу в пределах 500 пикселей от нижней части таблицы, извлекаем больше данных, если сможем
				if (
					scrollHeight - scrollTop - clientHeight < 500 &&
					!isFetching &&
					totalFetched < totalDBRowCount
				) {
					fetchNextPage()
				}
			}
		},
		[fetchNextPage, isFetching, totalFetched, totalDBRowCount]
	)
	//проверка при монтировании и после выборки, чтобы увидеть, не прокручена ли таблица уже вниз и ей нужно немедленно получить больше данных
	useEffect(() => {
		fetchMoreOnBottomReached(tableContainerRef.current)
	}, [fetchMoreOnBottomReached])

	//прокрутка к началу таблицы при сортировке изменений
	const handleSortingChange = updater => {
		setSorting(updater)
		if (!!table.getRowModel().rows.length) {
			rowVirtualizer.scrollToIndex?.(0)
		}
	}
	//поскольку этот параметр таблицы является производным от состояния модели строки таблицы, мы используем утилиту table.setOptions
	table.setOptions(prev => ({
		...prev,
		onSortingChange: handleSortingChange,
	}))

	const { rows } = table.getRowModel()

	const rowVirtualizer = useVirtualizer({
		count: rows.length,
		estimateSize: () => 33, //оцениваем высоту строки для точного перетаскивания полосы прокрутки
		getScrollElement: () => tableContainerRef.current,
		//измеряем динамическую высоту строки, за исключением Firefox, поскольку он неправильно измеряет высоту границы таблицы
		measureElement:
			typeof window !== 'undefined' &&
				navigator.userAgent.indexOf('Firefox') === -1
				? element => element?.getBoundingClientRect().height
				: undefined,
		overscan: 5,
	})

	if (isLoading) {
		return <>Loading...</>
	}

	return (<>
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
		{displayedPages ?
			<div className='p-2'>
				<table>
					<thead>
						{table.getHeaderGroups().map((headerGroup) => (
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
						))}
					</thead>
					<tbody>
						{table.getRowModel().rows.map((row) => {
							return (
								<tr key={row.id}>
									{row.getVisibleCells().map((cell) => {
										return <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
									})}
								</tr>
							)
						})}
					</tbody>
				</table>{displayedPages ? <>
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
					<div>
						<button onClick={() => rerender()}>Force Rerender</button>
					</div>
					<pre>{JSON.stringify({ columnFilters: table.getState().columnFilters }, null, 2)}</pre>
				</>
					: <></>}
			</div> :
			<div
				className="container"
				onScroll={e => fetchMoreOnBottomReached(e.target)}
				ref={tableContainerRef}
				style={{
					overflow: 'auto', //our scrollable table container
					position: 'relative', //needed for sticky header
					height: '600px', //should be a fixed height
				}}
			>
				{/* Even though we're still using sematic table tags, we must use CSS grid and flexbox for dynamic row heights */}
				<table style={{ display: 'grid' }}>
					<thead
						style={{
							display: 'grid',
							position: 'sticky',
							top: 0,
							zIndex: 1,
						}}
					>
						{table.getHeaderGroups().map(headerGroup => (
							<tr
								key={headerGroup.id}
								style={{ display: 'flex', width: '100%' }}
							>
								{headerGroup.headers.map(header => {
									return (
										<th
											key={header.id}
											style={{
												display: 'flex',
												width: header.getSize(),
											}}
										>
											<div
												{...{
													className: header.column.getCanSort()
														? 'cursor-pointer select-none'
														: '',
													onClick: header.column.getToggleSortingHandler(),
												}}
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
										</th>
									)
								})}
							</tr>
						))}
					</thead>
					<tbody
						style={{
							display: 'grid',
							height: `${rowVirtualizer.getTotalSize()}px`, //tells scrollbar how big the table is
							position: 'relative', //needed for absolute positioning of rows
						}}
					>
						{rowVirtualizer.getVirtualItems().map(virtualRow => {
							const row = rows[virtualRow.index]
							return (
								<tr
									data-index={virtualRow.index} //needed for dynamic row height measurement
									ref={node => rowVirtualizer.measureElement(node)} //measure dynamic row height
									key={row.id}
									style={{
										display: 'flex',
										position: 'absolute',
										transform: `translateY(${virtualRow.start}px)`, //this should always be a `style` as it changes on scroll
										width: '100%',
									}}
								>
									{row.getVisibleCells().map(cell => {
										return (
											<td
												key={cell.id}
												style={{
													display: 'flex',
													width: cell.column.getSize(),
												}}
											>
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
			</div>}
		{isFetching && <div>Fetching More...</div>}
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

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Failed to find the root element')

ReactDOM.createRoot(rootElement).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
)
