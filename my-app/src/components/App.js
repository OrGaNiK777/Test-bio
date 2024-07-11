import { useEffect, useMemo, useState } from 'react'
import './App.css'
import VirtTable from './virtTable/VirtTable'
import { FaSearch } from 'react-icons/fa'
import { postMovies } from '../api/api'
import PaginTable from './paginTable/PaginTable'
import { headlines } from '../constants/headlines'
import {
	useReactTable,
} from '@tanstack/react-table'

export default function App() {
	const [columnVisibility, setColumnVisibility] = useState({})
	const [displayedPages, setDisplayedPages] = useState(true)
	const [inputSearchMovie, setInputSearchMovie] = useState('')
	const [searchMovieМVis, setSearchMovie] = useState([])
	const columns = useMemo(() => headlines, [])
	function search(phrase) {
		postMovies({ search: phrase })
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
				setSearchMovie(items)
			})
			.catch((err) => {
				console.log(err)
			})
	}

	const onFormSubmit = (e) => {
		e.preventDefault()
		search(inputSearchMovie)
	}

	//VirtTable

	const table = useReactTable({
		columns,
		state: {
			columnVisibility
		},
		onColumnVisibilityChange: setColumnVisibility,
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
					<input placeholder='поиска фильмов по фразе' value={inputSearchMovie} onChange={(e) => { setInputSearchMovie(e.target.value); if (!(e.target.value)) { setSearchMovie([]) } }}></input>
					<button type='submit'>{<FaSearch />}</button>
				</form>
			</div>
			<button className='paginationBtn' onClick={() => { setDisplayedPages(!displayedPages) }}>{displayedPages ? "Pagination" : "All"}</button>
			{
				displayedPages ?
					<PaginTable{...{ searchMovieМVis, columns, columnVisibility, setColumnVisibility, inputSearchMovie }} />
					:
					<VirtTable {...{ searchMovieМVis, columns, columnVisibility, setColumnVisibility, inputSearchMovie }} />
			}
		</>
	)
}