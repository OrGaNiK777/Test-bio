import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import { postMovies } from '../../api/api'

function VirtTable({ displayedPages, columns, columnVisibility, setColumnVisibility }) {
	const fetchSize = 30
	const tableContainerRef = useRef(null)
	const [lengthMov, setLengthMov] = useState("-")
	const [sorting, setSorting] = useState([])
	//react-query has a useInfiniteQuery hook that is perfect for this use case
	const { data, fetchNextPage, isFetching, isLoading } = useInfiniteQuery({
		queryKey: [
			'movies',
			sorting, //refetch when sorting changes
		],
		queryFn: ({ pageParam = 1 }) => {
			const start = pageParam * fetchSize
			const fetchedData = postMovies({ pageSize: start })
				.then((item) => {
					setLengthMov(item.data_size)
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
					return {
						data: items.slice(start - fetchSize, start),
						meta: {
							totalRowCount: items.length,
						},
					}
				})
				.catch((err) => {
					console.log(err)
				})
			return fetchedData
		},
		initialPageParam: 1,
		getNextPageParam: (_lastGroup, groups) => groups.length,
		refetchOnWindowFocus: false,
		placeholderData: keepPreviousData,
	})
	//flatten the array of arrays from the useInfiniteQuery hook
	const flatData = useMemo(() => data?.pages?.flatMap((page) => page.data) ?? [], [data])
	const totalDBRowCount = lengthMov
	const totalFetched = flatData.length
	//called on scroll and possibly on mount to fetch more data as the user scrolls and reaches bottom of tabl
	const fetchMoreOnBottomReached = useCallback(
		(containerRefElement) => {
			if (containerRefElement) {
				const { scrollHeight, scrollTop, clientHeight } = containerRefElement
				//once the user has scrolled within 500px of the bottom of the table, fetch more data if we can
				if (scrollHeight - scrollTop - clientHeight < 900 && !isFetching && totalFetched < totalDBRowCount) {
					fetchNextPage()
				}
			}
		},
		[fetchNextPage, isFetching, totalFetched, totalDBRowCount]
	)
	//проверка при монтировании и после выборки, чтобы увидеть, прокручивается ли таблица уже до самого низа и нужно ли немедленно извлекать дополнительные данные
	useEffect(() => {
		fetchMoreOnBottomReached(tableContainerRef.current)
	}, [fetchMoreOnBottomReached])

	const table = useReactTable({
		data: flatData,
		columns,
		state: {
			sorting,
			columnVisibility,
		},
		onColumnVisibilityChange: setColumnVisibility,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		manualSorting: true,
		debugTable: true,
	})


	//прокрутите таблицу до начала при сортировке изменений
	const handleSortingChange = (updater) => {
		setSorting(updater)
		if (!!table.getRowModel().rows.length) {
			rowVirtualizer.scrollToIndex?.(0)
		}
	}

	//поскольку этот параметр таблицы является производным от состояния модели строк таблицы, мы используем утилиту table.setOptions
	table.setOptions((prev) => ({
		...prev,
		onSortingChange: handleSortingChange,
	}))

	const { rows } = table.getRowModel()

	const rowVirtualizer = useVirtualizer({
		count: rows.length,
		estimateSize: () => 33, //оцените высоту строки для точного перетаскивания полосы прокрутки
		getScrollElement: () => tableContainerRef.current,
		//измеряет динамическую высоту строки, за исключением firefox, поскольку он неправильно измеряет высоту границы таблицы
		measureElement: typeof window !== 'undefined' && navigator.userAgent.indexOf('Firefox') === -1 ? (element) => element?.getBoundingClientRect().height : undefined,
		overscan: 5,
	})

	if (isLoading) {
		return <>Loading...</>
	}

	return (
		<div className='app'>
			<div
				className='container'
				onScroll={(e) => fetchMoreOnBottomReached(e.target)}
				ref={tableContainerRef}
				style={{
					overflow: 'auto', //our scrollable table container
					position: 'relative', //needed for sticky header
					height: '100vh', //should be a fixed height
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
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id} style={{ display: 'flex', width: '100%' }}>
								{headerGroup.headers.map((header) => {
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
						{rowVirtualizer.getVirtualItems().map((virtualRow) => {
							const row = rows[virtualRow.index]
							return (
								<tr
									data-index={virtualRow.index} //needed for dynamic row height measurement
									ref={(node) => rowVirtualizer.measureElement(node)} //measure dynamic row height
									key={row.id}
									style={{
										display: 'flex',
										position: 'absolute',
										transform: `translateY(${virtualRow.start}px)`, //this should always be a `style` as it changes on scroll
										width: '100%',
									}}
								>
									{row.getVisibleCells().map((cell) => {
										return (
											<td
												key={cell.id}
												style={{
													display: 'flex',
													width: cell.column.getSize(),
												}}
											>
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</td>
										)
									})}
								</tr>
							)
						})}
					</tbody>
				</table>
			</div>
			{isFetching && <div>Fetching More...</div>}
		</div>
	)
}
export default VirtTable
