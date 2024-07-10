import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import { postMovies } from '../../api/api'
import Filter from '../Filter/Filter'

function VirtTable({ searchMovieМVis, columns, columnVisibility, setColumnVisibility }) {
	const fetchSize = 30
	const tableContainerRef = useRef(null)
	const [lengthMov, setLengthMov] = useState("-")
	const [sorting, setSorting] = useState([])

	const { data, fetchNextPage, isFetching } = useInfiniteQuery({
		queryKey: [
			'movies'
		],
		queryFn: ({ pageParam = 1 }) => {
			const start = pageParam * fetchSize
			const fetchedData = postMovies({ pageSize: start })
				.then((item) => {
					setLengthMov(item.data_size)
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

	const flatData = useMemo(() => data?.pages?.flatMap((page) => page.data) ?? [], [data])
	const totalDBRowCount = lengthMov
	const totalFetched = flatData.length
	const fetchMoreOnBottomReached = useCallback(
		(containerRefElement) => {
			if (containerRefElement) {
				const { scrollHeight, scrollTop, clientHeight } = containerRefElement

				if (scrollHeight - scrollTop - clientHeight < 900 && !isFetching && totalFetched < totalDBRowCount) {
					if (searchMovieМVis.length === 0) {
						fetchNextPage()
					}
				}
			}
		},
		[fetchNextPage, isFetching, totalFetched, totalDBRowCount]
	)

	useEffect(() => {
		fetchMoreOnBottomReached(tableContainerRef.current)
	}, [fetchMoreOnBottomReached])

	const table = useReactTable({
		data: (searchMovieМVis.length === 0) ? flatData : searchMovieМVis,
		columns,
		filterFns: {},
		state: {
			sorting,
			columnVisibility,
		},
		onColumnVisibilityChange: setColumnVisibility,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		manualSorting: false,
		debugTable: true,
	})

	const handleSortingChange = (updater) => {
		setSorting(updater)
		if (!!table.getRowModel().rows.length) {
			rowVirtualizer.scrollToIndex?.(0)
		}
	}

	table.setOptions((prev) => ({
		...prev,
		onSortingChange: handleSortingChange,
	}))

	const { rows } = table.getRowModel()

	const rowVirtualizer = useVirtualizer({
		count: rows.length,
		estimateSize: () => 70,
		getScrollElement: () => tableContainerRef.current,
		measureElement: typeof window !== 'undefined' && navigator.userAgent.indexOf('Firefox') === -1 ? (element) => element?.getBoundingClientRect().height : undefined,
		overscan: 5,
	})


	return (
		<div className='app'>
			<div
				className='container'
				onScroll={(e) => fetchMoreOnBottomReached(e.target)}
				ref={tableContainerRef}
				style={{
					overflow: 'auto',
					position: 'relative',
					height: '99.5vh',
				}}>
				<table style={{ display: 'grid' }}>
					<thead
						style={{
							display: 'grid',
							position: 'sticky',
							top: 68,
							zIndex: 1,
							backgroundColor: '#bbebca',
							height: "75px"
						}}
					>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id} style={{ display: 'flex', width: '100%' }}>
								{headerGroup.headers.map((header) => {
									return (
										<th
											key={header.id}
											style={{
												cursor: "pointer",
												display: 'flex',
												flexDirection: 'column',
												justifyContent: "space-around",
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
											{header.column.getCanFilter() ? (
												<div style={{
													display: 'flex',
													flexDirection: 'column',
													width: (header.getSize() - 10),
													marginLeft: "5px"
												}}>
													<Filter column={header.column} />
												</div>
											) : null}
										</th>
									)
								})}
							</tr>
						))}
					</thead>
					<tbody
						style={{
							display: 'grid',
							height: `${rowVirtualizer.getTotalSize()}px`,
							position: 'relative',
						}}
					>
						{rowVirtualizer.getVirtualItems().map((virtualRow) => {
							const row = rows[virtualRow.index]
							return (
								<tr
									data-index={virtualRow.index}
									ref={(node) => rowVirtualizer.measureElement(node)}
									key={row.id}
									style={{
										display: 'flex',
										position: 'absolute',
										transform: `translateY(${virtualRow.start}px)`,
										width: '100%',
									}}
								>
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
												</div>	</td>
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
