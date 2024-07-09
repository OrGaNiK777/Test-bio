import { useEffect, useMemo, useState } from 'react'
import './App.css'
import VirtTable from './virtTable/VirtTable'
import { FaSearch } from 'react-icons/fa'
import { postMovies } from '../api/api'
import PaginTable from './paginTable/PaginTable'
import { headlines } from '../constants/headlines'
import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
	getFilteredRowModel,
	getPaginationRowModel
} from '@tanstack/react-table'

export default function App() {

	const [displayedPages, setDisplayedPages] = useState(true)
	const [inputSearchMovie, setInputSearchMovie] = useState('')
	const [searchMovie, setSearchMovie] = useState({})

	const columns = useMemo(() => headlines, [])


	function downloadMovies() {
		postMovies({
			page: 0,
			pageSize: 100,
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
				setData(items)
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

	function search(phrase) {
		postMovies({ search: phrase })
			.then((item) => {
				setSearchMovie(item.data)
				console.log(item.data)
			})
			.catch((err) => {
				console.log(err)
			})
			.finally(() => { })
	}

	const onFormSubmit = (e) => {
		e.preventDefault()
		search(inputSearchMovie)
	}

	//VirtTable
	const [data, setData] = useState([])
	const [flatData, setFlatData] = useState([])
	const [sorting, setSorting] = useState([])
	const visDownMovies = (start, size, sorting) => {

		postMovies({
			pageSize: start
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
				setFlatData(items)
			})
			.catch((err) => {
				console.log(err)
			})

		return {
			data: flatData.slice(start, start + size),
			meta: {
				totalRowCount: flatData.length,
			},
		}
	}

	const table = useReactTable({
		data,
		columns,
		filterFns: {},
		state: {
			sorting,
		},
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(), //client side filtering
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: displayedPages ? getPaginationRowModel() : "",
		debugHeaders: true,
		debugColumns: false,
		debugTable: true,
		manualSorting: displayedPages ? false : true
	})

	return (
		<>
			<nav className="one">
				<ul className="topmenu">
					<li><a href="#">View<i className="fa fa-angle-down"></i></a>
						<ul className="submenu">
							{table.getAllLeafColumns().map((column) => {
								return (
									<label >
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
							})}
						</ul>
					</li>
				</ul >
			</nav >
			<div>
				<form className='d1' onSubmit={onFormSubmit}>
					<input placeholder='поиска фильмов по фразе' value={inputSearchMovie} onChange={(e) => setInputSearchMovie(e.target.value)}></input>
					<button type='submit'>{<FaSearch />}</button>
				</form>
			</div>
			<button className='paginationBtn' onClick={() => { setDisplayedPages(!displayedPages) }}>{displayedPages ? "Pagination" : "All"}</button>
			{displayedPages ?
				<PaginTable
					table={table}>
				</PaginTable >
				:
				<VirtTable
					table={table}
					setSorting={setSorting}
					sorting={sorting}
					visDownMovies={visDownMovies}
					setData={setData}
					flatData={flatData}
				></VirtTable>
			}

		</>


	)
}