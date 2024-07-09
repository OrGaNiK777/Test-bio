import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import { postMovies } from '../../api/api'

const fetchSize = 20
let mov = []
function VirtTable({ columns }) {
	const [data1, setData1] = useState([])

	const visDownMovies = (start, size) => {
		postMovies({ pageSize: start ? start : 10 })
			.then((item) => {
				const items = item.data.map((i) => {
					i.adult ? (i.adult = '18+') : (i.adult = '0+')
					i.belongs_to_collection == null ? (i.belongs_to_collection = '-') : (i.belongs_to_collection = i.belongs_to_collection.name)
					if (i.budget == null) {
						i.budget = '-'
					}
					Array.isArray(i.genres) ? (i.genres = i.genres.map((genre) => genre.name).join(', ')) : (i.genres = '-')
					Array.isArray(i.production_companies) ? (i.production_companies = i.production_companies.map((i) => i.name).join(', ')) : (i.production_companies = '-')
					Array.isArray(i.production_countries) ? (i.production_countries = i.production_countries.map((i) => i.name).join(', ')) : (i.production_countries = '-')
					Array.isArray(i.spoken_languages) ? (i.spoken_languages = i.spoken_languages.map((i) => i.name).join(', ')) : (i.spoken_languages = '-')
					return i
				})
				mov.unshift(...items)
				setData1(items)
				console.log(mov)
			})
			.catch((err) => {
				console.log(err)
			})

		return {
			data: data1.slice(start, start + size),
			meta: {
				totalRowCount: data1.length,
			}
		}

	}

	//we need a reference to the scrolling element for logic down below
	const tableContainerRef = useRef(null)

	const [sorting, setSorting] = useState([])

	//react-query has a useInfiniteQuery hook that is perfect for this use case
	const { data, fetchNextPage, isFetching, isLoading } = useInfiniteQuery({
		queryKey: [
			'movies',
			sorting, //refetch when sorting changes
		],
		queryFn: ({ pageParam = 0 }) => {
			const start = pageParam * fetchSize

			const fetchedData = visDownMovies(start, fetchSize) //pretend api call
			console.log(fetchedData)
			return fetchedData
		},
		initialPageParam: 0,
		getNextPageParam: (_lastGroup, groups) => groups.length,
		refetchOnWindowFocus: false,
		placeholderData: keepPreviousData,
	})
	//flatten the array of arrays from the useInfiniteQuery hook
	console.log(data)
	const flatData = useMemo(() => data?.pages?.flatMap((page) => page.data) ?? [], [data])
	const totalDBRowCount = data?.pages?.[0]?.meta?.totalRowCount ?? 0
	const totalFetched = flatData.length
	console.log(flatData)
	//called on scroll and possibly on mount to fetch more data as the user scrolls and reaches bottom of table
	const fetchMoreOnBottomReached = useCallback(
		(containerRefElement) => {
			if (containerRefElement) {
				const { scrollHeight, scrollTop, clientHeight } = containerRefElement
				//once the user has scrolled within 500px of the bottom of the table, fetch more data if we can
				if (scrollHeight - scrollTop - clientHeight < 700 && !isFetching && totalFetched < totalDBRowCount) {
					console.log("внизу")
					fetchNextPage()
				}
				if (scrollHeight - scrollTop - clientHeight < 700) {
					fetchNextPage()
					console.log("внизу1")
				}
			}
		},
		[fetchNextPage, isFetching, totalFetched, totalDBRowCount]
	)

	//a check on mount and after a fetch to see if the table is already scrolled to the bottom and immediately needs to fetch more data
	useEffect(() => {
		fetchMoreOnBottomReached(tableContainerRef.current)
	}, [fetchMoreOnBottomReached])

	const table = useReactTable({
		data: flatData.length === 0 ? data1 : flatData,
		columns,
		state: {
			sorting,
		},
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		manualSorting: true,
		debugTable: true,
	})
	//scroll to top of table when sorting changes
	const handleSortingChange = (updater) => {
		setSorting(updater)
		if (!!table.getRowModel().rows.length) {
			rowVirtualizer.scrollToIndex?.(0)
		}
	}

	//since this table option is derived from table row model state, we're using the table.setOptions utility
	table.setOptions((prev) => ({
		...prev,
		onSortingChange: handleSortingChange,
	}))

	const { rows } = table.getRowModel()

	const rowVirtualizer = useVirtualizer({
		count: rows.length,
		estimateSize: () => 33, //estimate row height for accurate scrollbar dragging
		getScrollElement: () => tableContainerRef.current,
		//measure dynamic row height, except in firefox because it measures table border height incorrectly
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
