import React, { HTMLAttributes } from 'react'
import ReactDOM from 'react-dom'

import './index.css'

import {
  createTable,
  columnFilterRowsFn,
  paginateRowsFn,
  Column,
  TableInstance,
  PaginationState,
  useTable,
  ExpandedState,
  expandRowsFn,
} from '@tanstack/react-table'
import { makeData, Person } from './makeData'

let table = createTable<{ Row: Person }>()

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
              header: ({ instance }) => (
                <>
                  <IndeterminateCheckbox
                    {...instance.getToggleAllRowsSelectedProps()}
                  />{' '}
                  <span {...instance.getToggleAllRowsExpandedProps()}>
                    {instance.getIsAllRowsExpanded() ? '👇' : '👉'}
                  </span>{' '}
                  First Name
                </>
              ),
              cell: ({ row, value }) => (
                // Use the row.canExpand and row.getToggleRowExpandedProps prop getter
                // to build the toggle for expanding a row
                <div
                  style={{
                    // Since rows are flattened by default,
                    // we can use the row.depth property
                    // and paddingLeft to visually indicate the depth
                    // of the row
                    paddingLeft: `${row.depth * 2}rem`,
                  }}
                >
                  <IndeterminateCheckbox {...row.getToggleSelectedProps()} />{' '}
                  <span
                    {...row.getToggleExpandedProps(props => ({
                      ...props,
                      style: {
                        cursor: props.onClick ? 'pointer' : 'normal',
                      },
                    }))}
                  >
                    {row.getCanExpand()
                      ? row.getIsExpanded()
                        ? '👇'
                        : '👉'
                      : '🔵'}{' '}
                    {value}
                  </span>
                </div>
              ),
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

  const [data, setData] = React.useState(() => makeData(100, 5, 3))
  const refreshData = () => setData(() => makeData(100, 5, 3))

  const [expanded, setExpanded] = React.useState<ExpandedState>({})

  const instance = useTable(table, {
    data,
    columns,
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
    paginateRowsFn: paginateRowsFn,
    expandRowsFn: expandRowsFn,
    columnFilterRowsFn: columnFilterRowsFn,
    getSubRows: row => row.subRows,
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
      <pre>{JSON.stringify(expanded, null, 2)}</pre>
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

function IndeterminateCheckbox({
  indeterminate,
  className = '',
  ...rest
}: { indeterminate: boolean } & HTMLAttributes<HTMLInputElement>) {
  const ref = React.useRef<HTMLInputElement>(null!)

  React.useEffect(() => {
    ref.current.indeterminate = indeterminate
  }, [ref, indeterminate])

  return (
    <input
      type="checkbox"
      ref={ref}
      className={className + ' cursor-pointer'}
      {...rest}
    />
  )
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)
