import { MouseEvent, TouchEvent } from 'react'
import { RowModel } from '..'
import { BuiltInSortType, reSplitAlphaNumeric, sortTypes } from '../sortTypes'

import {
  Column,
  Getter,
  Header,
  OnChangeFn,
  AnyGenerics,
  PartialGenerics,
  PropGetterValue,
  TableInstance,
  Row,
  Updater,
} from '../types'

import {
  functionalUpdate,
  isFunction,
  makeStateUpdater,
  memo,
  Overwrite,
  propGetter,
} from '../utils'

export type SortDirection = 'asc' | 'desc'

export type ColumnSort = {
  id: string
  desc: boolean
}

export type SortingState = ColumnSort[]

export type SortingFn<TGenerics extends AnyGenerics> = {
  (rowA: Row<TGenerics>, rowB: Row<TGenerics>, columnId: string): number
}

export type CustomSortingTypes<TGenerics extends AnyGenerics> = Record<
  string,
  SortingFn<TGenerics>
>

export type SortingTableState = {
  sorting: SortingState
}

export type SortType<TGenerics extends AnyGenerics> =
  | 'auto'
  | BuiltInSortType
  | keyof TGenerics['SortingFns']
  | SortingFn<TGenerics>

export type SortingColumnDef<TGenerics extends AnyGenerics> = {
  sortType?: SortType<Overwrite<TGenerics, { Value: any }>>
  sortDescFirst?: boolean
  enableSorting?: boolean
  enableMultiSort?: boolean
  defaultCanSort?: boolean
  invertSorting?: boolean
  sortUndefined?: false | -1 | 1
}

export type SortingColumn<TGenerics extends AnyGenerics> = {
  sortType: SortType<Overwrite<TGenerics, { Value: any }>>
  getCanSort: () => boolean
  getCanMultiSort: () => boolean
  getSortIndex: () => number
  getIsSorted: () => false | SortDirection
  resetSorting: () => void
  toggleSorting: (desc?: boolean, isMulti?: boolean) => void
  getToggleSortingProps: <TGetter extends Getter<ToggleSortingProps>>(
    userProps?: TGetter
  ) => undefined | PropGetterValue<ToggleSortingProps, TGetter>
}

export type SortingOptions<TGenerics extends AnyGenerics> = {
  sortTypes?: TGenerics['SortingFns']
  onSortingChange?: OnChangeFn<SortingState>
  autoResetSorting?: boolean
  enableSorting?: boolean
  enableSortingRemoval?: boolean
  enableMultiRemove?: boolean
  enableMultiSort?: boolean
  sortDescFirst?: boolean
  sortRowsFn?: (
    instance: TableInstance<TGenerics>,
    rowModel: RowModel<TGenerics>
  ) => RowModel<TGenerics>
  maxMultiSortColCount?: number
  isMultiSortEvent?: (e: MouseEvent | TouchEvent) => boolean
}

export type ToggleSortingProps = {
  title?: string
  onClick?: (event: MouseEvent | TouchEvent) => void
}

export type SortingInstance<TGenerics extends AnyGenerics> = {
  _notifySortingReset: () => void
  getColumnAutoSortingFn: (columnId: string) => SortingFn<TGenerics> | undefined
  getColumnAutoSortDir: (columnId: string) => SortDirection

  getColumnSortingFn: (columnId: string) => SortingFn<TGenerics> | undefined

  setSorting: (updater: Updater<SortingState>) => void
  toggleColumnSorting: (
    columnId: string,
    desc?: boolean,
    multi?: boolean
  ) => void
  resetSorting: (columnId?: string) => void
  getColumnCanSort: (columnId: string) => boolean
  getColumnCanMultiSort: (columnId: string) => boolean
  getColumnIsSorted: (columnId: string) => false | 'asc' | 'desc'
  getColumnSortIndex: (columnId: string) => number
  getToggleSortingProps: <TGetter extends Getter<ToggleSortingProps>>(
    columnId: string,
    userProps?: TGetter
  ) => undefined | PropGetterValue<ToggleSortingProps, TGetter>
  getPreSortedRowModel: () => RowModel<TGenerics>
  getSortedRowModel: () => RowModel<TGenerics>
}

//

export const Sorting = {
  getDefaultColumn: <
    TGenerics extends AnyGenerics
  >(): SortingColumnDef<TGenerics> => {
    return {
      sortType: 'auto',
    }
  },

  getInitialState: (): SortingTableState => {
    return {
      sorting: [],
    }
  },

  getDefaultOptions: <TGenerics extends AnyGenerics>(
    instance: TableInstance<TGenerics>
  ): SortingOptions<TGenerics> => {
    return {
      onSortingChange: makeStateUpdater('sorting', instance),
      autoResetSorting: true,
      isMultiSortEvent: (e: MouseEvent | TouchEvent) => {
        return e.shiftKey
      },
    }
  },

  createColumn: <TGenerics extends AnyGenerics>(
    column: Column<TGenerics>,
    instance: TableInstance<TGenerics>
  ): SortingColumn<TGenerics> => {
    return {
      sortType: column.sortType,
      getCanSort: () => instance.getColumnCanSort(column.id),
      getCanMultiSort: () => instance.getColumnCanMultiSort(column.id),
      getSortIndex: () => instance.getColumnSortIndex(column.id),
      getIsSorted: () => instance.getColumnIsSorted(column.id),
      resetSorting: () => instance.resetSorting(column.id),
      toggleSorting: (desc, isMulti) =>
        instance.toggleColumnSorting(column.id, desc, isMulti),
      getToggleSortingProps: userProps =>
        instance.getToggleSortingProps(column.id, userProps),
    }
  },

  getInstance: <TGenerics extends AnyGenerics>(
    instance: TableInstance<TGenerics>
  ): SortingInstance<TGenerics> => {
    let registered = false

    return {
      _notifySortingReset: () => {
        if (!registered) {
          registered = true
          return
        }

        if (instance.options.autoResetAll === false) {
          return
        }

        if (
          instance.options.autoResetAll === true ||
          instance.options.autoResetSorting
        ) {
          instance.resetSorting()
        }
      },
      getColumnAutoSortingFn: columnId => {
        const firstRows = instance
          .getGlobalFilteredRowModel()
          .flatRows.slice(100)

        let isString = false

        for (const row of firstRows) {
          const value = row?.values[columnId]

          if (Object.prototype.toString.call(value) === '[object Date]') {
            return sortTypes.datetime
          }

          if (typeof value === 'string') {
            isString = true

            if (value.split(reSplitAlphaNumeric).length > 1) {
              return sortTypes.alphanumeric
            }
          }
        }

        if (isString) {
          return sortTypes.text
        }

        return sortTypes.basic
      },
      getColumnAutoSortDir: columnId => {
        const firstRow = instance.getGlobalFilteredRowModel().flatRows[0]

        const value = firstRow?.values[columnId]

        if (typeof value === 'string') {
          return 'asc'
        }

        return 'desc'
      },
      getColumnSortingFn: columnId => {
        const column = instance.getColumn(columnId)
        const userSortTypes = instance.options.sortTypes

        if (!column) {
          throw new Error()
        }

        return isFunction(column.sortType)
          ? column.sortType
          : column.sortType === 'auto'
          ? instance.getColumnAutoSortingFn(columnId)
          : (userSortTypes as Record<string, any>)?.[
              column.sortType as string
            ] ??
            (sortTypes[
              column.sortType as BuiltInSortType
            ] as SortingFn<TGenerics>)
      },

      setSorting: updater =>
        instance.options.onSortingChange?.(
          updater,
          functionalUpdate(updater, instance.getState().sorting)
        ),

      toggleColumnSorting: (columnId, desc, multi) => {
        const column = instance.getColumn(columnId)

        if (!column) {
          throw new Error()
        }

        // if (column.columns.length) {
        //   column.columns.forEach((c, i) => {
        //     if (c.id) {
        //       instance.toggleColumnSorting(c.id, undefined, multi || !!i)
        //     }
        //   })
        //   return
        // }

        instance.setSorting(old => {
          // Find any existing sorting for this column
          const existingSorting = old?.find(d => d.id === columnId)
          const existingIndex = old?.findIndex(d => d.id === columnId)
          const hasDescDefined = typeof desc !== 'undefined' && desc !== null

          let newSorting: SortingState = []

          // What should we do with this sort action?
          let sortAction

          if (column.getCanMultiSort() && multi) {
            if (existingSorting) {
              sortAction = 'toggle'
            } else {
              sortAction = 'add'
            }
          } else {
            // Normal mode
            if (old?.length && existingIndex !== old.length - 1) {
              sortAction = 'replace'
            } else if (existingSorting) {
              sortAction = 'toggle'
            } else {
              sortAction = 'replace'
            }
          }

          const sortDescFirst =
            column.sortDescFirst ??
            instance.options.sortDescFirst ??
            instance.getColumnAutoSortDir(columnId) === 'desc'

          // Handle toggle states that will remove the sorting
          if (
            sortAction === 'toggle' && // Must be toggling
            (instance.options.enableSortingRemoval ?? true) && // If enableSortRemove, enable in general
            !hasDescDefined && // Must not be setting desc
            (multi ? instance.options.enableMultiRemove ?? true : true) && // If multi, don't allow if enableMultiRemove
            (existingSorting?.desc // Finally, detect if it should indeed be removed
              ? !sortDescFirst
              : sortDescFirst)
          ) {
            sortAction = 'remove'
          }

          if (sortAction === 'replace') {
            newSorting = [
              {
                id: columnId,
                desc: hasDescDefined ? desc! : !!sortDescFirst,
              },
            ]
          } else if (sortAction === 'add' && old?.length) {
            newSorting = [
              ...old,
              {
                id: columnId,
                desc: hasDescDefined ? desc! : !!sortDescFirst,
              },
            ]
            // Take latest n columns
            newSorting.splice(
              0,
              newSorting.length -
                (instance.options.maxMultiSortColCount ??
                  Number.MAX_SAFE_INTEGER)
            )
          } else if (sortAction === 'toggle' && old?.length) {
            // This flips (or sets) the
            newSorting = old.map(d => {
              if (d.id === columnId) {
                return {
                  ...d,
                  desc: hasDescDefined ? desc! : !existingSorting?.desc,
                }
              }
              return d
            })
          } else if (sortAction === 'remove' && old?.length) {
            newSorting = old.filter(d => d.id !== columnId)
          }

          return newSorting
        })
      },

      getColumnCanSort: columnId => {
        const column = instance.getColumn(columnId)

        if (!column) {
          throw new Error()
        }

        return (
          column.enableSorting ??
          instance.options.enableSorting ??
          column.defaultCanSort ??
          !!column.accessorFn
          // (!!column.accessorFn ||
          //   column.columns?.some(c => c.id && instance.getColumnCanSort(c.id))) ??
          // false
        )
      },

      getColumnCanMultiSort: columnId => {
        const column = instance.getColumn(columnId)

        if (!column) {
          throw new Error()
        }

        return (
          column.enableMultiSort ??
          instance.options.enableMultiSort ??
          !!column.accessorFn
        )
      },

      getColumnIsSorted: columnId => {
        const columnSort = instance
          .getState()
          .sorting?.find(d => d.id === columnId)

        return !columnSort ? false : columnSort.desc ? 'desc' : 'asc'
      },

      getColumnSortIndex: columnId =>
        instance.getState().sorting?.findIndex(d => d.id === columnId) ?? -1,

      resetSorting: (columnId?: string) => {
        if (columnId) {
          instance.setSorting(old =>
            old?.length ? old.filter(d => d.id !== columnId) : []
          )
        } else {
          instance.setSorting(instance.initialState?.sorting ?? [])
        }
      },

      getToggleSortingProps: (columnId, userProps) => {
        const column = instance.getColumn(columnId)

        if (!column) {
          throw new Error()
        }

        const canSort = column.getCanSort()

        const initialProps: ToggleSortingProps = {
          title: canSort ? 'Toggle Sorting' : undefined,
          onClick: canSort
            ? (e: MouseEvent | TouchEvent) => {
                e.persist?.()
                column.toggleSorting?.(
                  undefined,
                  column.getCanMultiSort()
                    ? instance.options.isMultiSortEvent?.(e)
                    : false
                )
              }
            : undefined,
        }

        return propGetter(initialProps, userProps)
      },

      getPreSortedRowModel: () => instance.getGlobalFilteredRowModel(),
      getSortedRowModel: memo(
        () => [
          instance.getState().sorting,
          instance.getGlobalFilteredRowModel(),
          instance.options.sortRowsFn,
        ],
        (sorting, rowModel, sortingFn) => {
          if (!sortingFn || !sorting?.length) {
            return rowModel
          }

          return sortingFn(instance, rowModel)
        },
        {
          key: 'getSortedRowModel',
          debug: () => instance.options.debugAll ?? instance.options.debugTable,
          onChange: () => {
            instance._notifyGroupingReset()
          },
        }
      ),
    }
  },
}
