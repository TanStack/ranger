import React from 'react'
import ReactDOM from 'react-dom'

//
import './index.css'

//
import {
  createTable,
  columnFilterRowsFn,
  paginateRowsFn,
  Column,
  TableInstance,
  useTable,
  ColumnDef,
} from '@tanstack/react-table'
import { makeData, Person } from './makeData'

let table = createTable<{
  Row: Person
  TableMeta: {
    // We can tell our table about a custom "updateData" method we will provide it
    updateData: (rowIndex: number, columnId: string, value: unknown) => void
  }
}>()

// Get our table generics
type TableGenerics = typeof table.generics

// Give our default column cell renderer editing superpowers!
const defaultColumn: Partial<ColumnDef<TableGenerics>> = {
  cell: ({ value: initialValue, row: { index }, column: { id }, instance }) => {
    // We need to keep and update the state of the cell normally
    const [value, setValue] = React.useState(initialValue)

    const onChange = e => {
      setValue(e.target.value)
    }

    // When the input is blurred, we'll call our table meta's updateData function
    const onBlur = () => {
      instance.options.meta.updateData(index, id, value)
    }

    // If the initialValue is changed external, sync it up with our state
    React.useEffect(() => {
      setValue(initialValue)
    }, [initialValue])

    return <input value={value as string} onChange={onChange} onBlur={onBlur} />
  },
}

function App() {
  const rerender = React.useReducer(() => ({}), {})[1]

  const columns = React.useMemo(
    () =>
      table.createColumns([
        table.createGroup({
          header: 'Name',
          footer: props => props.column.id,
          columns: [
            table.createDataColumn('firstName', {
              cell: info => info.value,
              footer: props => props.column.id,
            }),
            table.createDataColumn(row => row.lastName, {
              id: 'lastName',
              cell: info => info.value,
              header: () => <span>Last Name</span>,
              footer: props => props.column.id,
            }),
          ],
        }),
        table.createGroup({
          header: 'Info',
          footer: props => props.column.id,
          columns: [
            table.createDataColumn('age', {
              header: () => 'Age',
              footer: props => props.column.id,
            }),
            table.createGroup({
              header: 'More Info',
              columns: [
                table.createDataColumn('visits', {
                  header: () => <span>Visits</span>,
                  footer: props => props.column.id,
                }),
                table.createDataColumn('status', {
                  header: 'Status',
                  footer: props => props.column.id,
                }),
                table.createDataColumn('progress', {
                  header: 'Profile Progress',
                  footer: props => props.column.id,
                }),
              ],
            }),
          ],
        }),
      ]),
    []
  )

  const [data, setData] = React.useState(() => makeData(1000))
  const refreshData = () => setData(() => makeData(1000))

  const instance = useTable(table, {
    data,
    columns,
    defaultColumn,
    paginateRowsFn: paginateRowsFn,
    columnFilterRowsFn: columnFilterRowsFn,
    // Provide our updateData function to our table meta
    meta: {
      updateData: (rowIndex, columnId, value) => {
        setData(old =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...old[rowIndex],
                [columnId]: value,
              }
            }
            return row
          })
        )
      },
    },
    debugTable: true,
  })

  return (
    <div className="p-2">
      <div className="h-2" />
      <table {...instance.getTableProps({})}>
        <thead>
          {instance.getHeaderGroups().map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(header => {
                return (
                  <th {...header.getHeaderProps()}>
                    {header.isPlaceholder ? null : (
                      <div>
                        {header.renderHeader()}
                        {header.column.getCanColumnFilter() ? (
                          <div>
                            <Filter
                              column={header.column}
                              instance={instance}
                            />
                          </div>
                        ) : null}
                      </div>
                    )}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody {...instance.getTableBodyProps()}>
          {instance.getRowModel().rows.map(row => {
            return (
              <tr {...row.getRowProps()}>
                {row.getVisibleCells().map(cell => {
                  return <td {...cell.getCellProps()}>{cell.renderCell()}</td>
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="h-2" />
      <div className="flex items-center gap-2">
        <button
          className="border rounded p-1"
          onClick={() => instance.setPageIndex(0)}
          disabled={!instance.getCanPreviousPage()}
        >
          {'<<'}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => instance.previousPage()}
          disabled={!instance.getCanPreviousPage()}
        >
          {'<'}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => instance.nextPage()}
          disabled={!instance.getCanNextPage()}
        >
          {'>'}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => instance.setPageIndex(instance.getPageCount() - 1)}
          disabled={!instance.getCanNextPage()}
        >
          {'>>'}
        </button>
        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {instance.getState().pagination.pageIndex + 1} of{' '}
            {instance.getPageCount()}
          </strong>
        </span>
        <span className="flex items-center gap-1">
          | Go to page:
          <input
            type="number"
            defaultValue={instance.getState().pagination.pageIndex + 1}
            onChange={e => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0
              instance.setPageIndex(page)
            }}
            className="border p-1 rounded w-16"
          />
        </span>
        <select
          value={instance.getState().pagination.pageSize}
          onChange={e => {
            instance.setPageSize(Number(e.target.value))
          }}
        >
          {[10, 20, 30, 40, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
      <div>{instance.getRowModel().rows.length} Rows</div>
      <div>
        <button onClick={() => rerender()}>Force Rerender</button>
      </div>
      <div>
        <button onClick={() => refreshData()}>Refresh Data</button>
      </div>
    </div>
  )
}

function Filter({
  column,
  instance,
}: {
  column: Column<any>
  instance: TableInstance<any>
}) {
  const firstValue =
    instance.getPreColumnFilteredRowModel().flatRows[0].values[column.id]

  return typeof firstValue === 'number' ? (
    <div className="flex space-x-2">
      <input
        type="number"
        min={Number(column.getPreFilteredMinMaxValues()[0])}
        max={Number(column.getPreFilteredMinMaxValues()[1])}
        value={(column.getColumnFilterValue()?.[0] ?? '') as string}
        onChange={e =>
          column.setColumnFilterValue(old => [e.target.value, old?.[1]])
        }
        placeholder={`Min (${column.getPreFilteredMinMaxValues()[0]})`}
        className="w-24 border shadow rounded"
      />
      <input
        type="number"
        min={Number(column.getPreFilteredMinMaxValues()[0])}
        max={Number(column.getPreFilteredMinMaxValues()[1])}
        value={(column.getColumnFilterValue()?.[1] ?? '') as string}
        onChange={e =>
          column.setColumnFilterValue(old => [old?.[0], e.target.value])
        }
        placeholder={`Max (${column.getPreFilteredMinMaxValues()[1]})`}
        className="w-24 border shadow rounded"
      />
    </div>
  ) : (
    <input
      type="text"
      value={(column.getColumnFilterValue() ?? '') as string}
      onChange={e => column.setColumnFilterValue(e.target.value)}
      placeholder={`Search... (${column.getPreFilteredUniqueValues().size})`}
      className="w-36 border shadow rounded"
    />
  )
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)
