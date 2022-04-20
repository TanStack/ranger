import { functionalUpdate, makeStateUpdater, memo } from '../utils'

import {
  TableInstance,
  OnChangeFn,
  Updater,
  Column,
  AnyGenerics,
  PartialGenerics,
} from '../types'

import { Grouping } from './Grouping'

export type ColumnOrderState = string[]

export type ColumnOrderTableState = {
  columnOrder: ColumnOrderState
}

export type ColumnOrderOptions = {
  onColumnOrderChange?: OnChangeFn<ColumnOrderState>
}

export type ColumnOrderDefaultOptions = {
  onColumnOrderChange: OnChangeFn<ColumnOrderState>
}

export type ColumnOrderInstance<TGenerics extends AnyGenerics> = {
  setColumnOrder: (updater: Updater<ColumnOrderState>) => void
  resetColumnOrder: () => void
  getOrderColumnsFn: () => (columns: Column<TGenerics>[]) => Column<TGenerics>[]
}

//

export const Ordering = {
  getInitialState: (): ColumnOrderTableState => {
    return {
      columnOrder: [],
    }
  },

  getDefaultOptions: <TGenerics extends AnyGenerics>(
    instance: TableInstance<TGenerics>
  ): ColumnOrderDefaultOptions => {
    return {
      onColumnOrderChange: makeStateUpdater('columnOrder', instance),
    }
  },

  getInstance: <TGenerics extends AnyGenerics>(
    instance: TableInstance<TGenerics>
  ): ColumnOrderInstance<TGenerics> => {
    return {
      setColumnOrder: updater =>
        instance.options.onColumnOrderChange?.(
          updater,
          functionalUpdate(updater, instance.getState().columnOrder)
        ),
      resetColumnOrder: () => {
        instance.setColumnOrder(instance.initialState.columnOrder ?? [])
      },
      getOrderColumnsFn: memo(
        () => [
          instance.getState().columnOrder,
          instance.getState().grouping,
          instance.options.groupedColumnMode,
        ],
        (columnOrder, grouping, groupedColumnMode) => columns => {
          // Sort grouped columns to the start of the column list
          // before the headers are built
          let orderedColumns: Column<TGenerics>[] = []

          // If there is no order, return the normal columns
          if (!columnOrder?.length) {
            orderedColumns = columns
          } else {
            const columnOrderCopy = [...columnOrder]

            // If there is an order, make a copy of the columns
            const columnsCopy = [...columns]

            // And make a new ordered array of the columns

            // Loop over the columns and place them in order into the new array
            while (columnsCopy.length && columnOrderCopy.length) {
              const targetColumnId = columnOrderCopy.shift()
              const foundIndex = columnsCopy.findIndex(
                d => d.id === targetColumnId
              )
              if (foundIndex > -1) {
                orderedColumns.push(columnsCopy.splice(foundIndex, 1)[0]!)
              }
            }

            // If there are any columns left, add them to the end
            orderedColumns = [...orderedColumns, ...columnsCopy]
          }

          return Grouping.orderColumns(
            orderedColumns,
            grouping,
            groupedColumnMode
          )
        },
        {
          key: 'getOrderColumnsFn',
          // debug: () => instance.options.debugAll ?? instance.options.debugTable,
        }
      ),
    }
  },
}
