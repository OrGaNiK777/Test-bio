import { useEffect, useState } from 'react'

export default function Filter({ column }) {
  const columnFilterValue = column.getFilterValue()
  const { filterVariant } = column.columnDef.meta ?? {}
  return filterVariant === 'range' ? (
    <div>
      <div className='flex space-x-2'>
        <DebouncedInput type='number' value={(columnFilterValue)?.[0] ?? ''} onChange={(value) => column.setFilterValue((old) => [value, old?.[1]])} placeholder={`Min`} className='w-24 border shadow rounded' />
        <DebouncedInput type='number' value={(columnFilterValue)?.[1] ?? ''} onChange={(value) => column.setFilterValue((old) => [old?.[0], value])} placeholder={`Max`} className='w-24 border shadow rounded' />
      </div>
      <div className='h-1' />
    </div>
  ) : filterVariant === 'select' ? (
    <select onChange={(e) => column.setFilterValue(e.target.value)} value={columnFilterValue?.toString()}>
      <option value=''>All</option>
      <option value='complicated'>complicated</option>
      <option value='relationship'>relationship</option>
      <option value='single'>single</option>
    </select>
  ) : (
    <DebouncedInput className='w-36 border shadow rounded' onChange={(value) => column.setFilterValue(value)} placeholder={`Search...`} type='text' value={(columnFilterValue ?? '')} />

  )
}

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
  }, [value])

  return <input {...props} value={value} onChange={(e) => setValue(e.target.value)} />
}