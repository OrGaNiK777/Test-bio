import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useVirtualizer } from '@tanstack/react-virtual'
import { flexRender } from '@tanstack/react-table'
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'

export default function VirtTable({ flatData, table, setData, dataMov, sorting, setSorting, visDownMovies }) {
	const tableContainerRef = useRef(null)
	const fetchSize = 5

	//react-query имеет хук useInfiniteQuery, который идеально подходит для этого варианта использования
	const { data, fetchNextPage, isFetching, isLoading } = useInfiniteQuery({
		queryKey: [
			'movies',
			sorting, //refetch when sorting changes
		],
		queryFn: ({ pageParam = 0 }) => {
			const start = pageParam * fetchSize
			const fetchedData = visDownMovies(start, fetchSize, sorting)
			return fetchedData
		},
		initialPageParam: 0,
		getNextPageParam: (_lastGroup, groups) => groups.length,
		refetchOnWindowFocus: false,
		placeholderData: keepPreviousData,
	})

	//сглаживаем массив массивов из хука useInfiniteQuery
	console.log(data)
	//const flatData = useMemo(() => data?.pages?.flatMap((page) => page.data) ?? [], [data])
	const totalDBRowCount = data?.pages?.[0]?.meta?.totalRowCount ?? 0
	const totalFetched = flatData.length
	//console.log(flatData)
	//бесконечная прокрутка
	useEffect(() => {
		setData(flatData)
	})
	//вызывается при прокрутке и, возможно, при монтировании, чтобы получить больше данных, когда пользователь прокручивает и достигает нижней части таблицы
	const fetchMoreOnBottomReached = useCallback(
		(containerRefElement) => {
			if (containerRefElement) {
				const { scrollHeight, scrollTop, clientHeight } = containerRefElement
				//как только пользователь прокрутит таблицу в пределах 500 пикселей от нижней части таблицы, извлекаем больше данных, если сможем
				if (scrollHeight - scrollTop - clientHeight < 500 && !isFetching && totalFetched < totalDBRowCount) {
					console.log(scrollHeight - scrollTop - clientHeight < 700)
					// console.log(isFetching)
					// console.log(totalFetched)
					// console.log(totalDBRowCount)
					//setData(flatData)
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
	const handleSortingChange = (updater) => {
		setSorting(updater)
		if (!!table.getRowModel().rows.length) {
			rowVirtualizer.scrollToIndex?.(0)
		}
	}
	//поскольку этот параметр таблицы является производным от состояния модели строки таблицы, мы используем утилиту table.setOptions
	table.setOptions((prev) => ({
		...prev,
		onSortingChange: handleSortingChange,
	}))

	const { rows } = table.getRowModel()

	const rowVirtualizer = useVirtualizer({
		count: rows.length,
		estimateSize: () => 33, //оцениваем высоту строки для точного перетаскивания полосы прокрутки
		getScrollElement: () => tableContainerRef.current,
		//измеряем динамическую высоту строки, за исключением Firefox, поскольку он неправильно измеряет высоту границы таблицы
		measureElement: typeof window !== 'undefined' && navigator.userAgent.indexOf('Firefox') === -1 ? (element) => element?.getBoundingClientRect().height : undefined,
		overscan: 5,
	})

	if (isLoading) {
		return <>Loading...</>
	}

	return (
		<>
			<div
				className='container'
				onScroll={(e) => fetchMoreOnBottomReached(e.target)}
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
		</>
	)
}
