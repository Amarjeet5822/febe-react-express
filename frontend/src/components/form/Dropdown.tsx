import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Icon } from '../ui/Icon'
import { Popover } from '../ui/Popover'
import { Spinner } from '../ui/Spinner'
import { FieldShell, type FieldBaseProps } from './FieldShell'
import { useFieldIds } from './useFieldIds'

export type DropdownValue = string | number

export type DropdownOption<V extends DropdownValue = string> = {
  value: V
  label: string
  description?: string
  icon?: ReactNode
  disabled?: boolean
  /** Options with the same group are listed under a heading. */
  group?: string
}

type BaseProps<V extends DropdownValue> = FieldBaseProps & {
  options: DropdownOption<V>[]
  placeholder?: string
  /** Adds a search box at the top of the menu. */
  searchable?: boolean
  searchPlaceholder?: string
  clearable?: boolean
  disabled?: boolean
  loading?: boolean
  emptyMessage?: ReactNode
  /** Adds hidden <input name=…> so it submits with a native/React Router <Form>. */
  name?: string
  /** Fires when the menu opens — handy for lazy-loading options. */
  onOpen?: () => void
}

type SingleProps<V extends DropdownValue> = BaseProps<V> & {
  multiple?: false
  value: V | null
  onChange: (value: V | null) => void
}

type MultiProps<V extends DropdownValue> = BaseProps<V> & {
  multiple: true
  value: V[]
  onChange: (value: V[]) => void
  maxSelected?: number
}

/** `multiple` switches the value type between `V | null` and `V[]` (a discriminated union). */
export type DropdownProps<V extends DropdownValue = string> = SingleProps<V> | MultiProps<V>

function filterOptions<V extends DropdownValue>(options: DropdownOption<V>[], query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return options
  return options.filter((o) => o.label.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q))
}

function firstEnabled<V extends DropdownValue>(options: DropdownOption<V>[], from = 0, dir: 1 | -1 = 1) {
  for (let i = from; i >= 0 && i < options.length; i += dir) if (!options[i]!.disabled) return i
  return -1
}

/** Wraps the matched part of the label in <mark>. */
function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim()
  const index = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1
  if (index < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, index)}
      <mark>{text.slice(index, index + q.length)}</mark>
      {text.slice(index + q.length)}
    </>
  )
}

const MAX_CHIPS = 3

/**
 * Select / multi-select following the WAI-ARIA combobox + listbox pattern.
 *  Keyboard: ↓/↑/Enter/Space open · ↑/↓ move · Home/End · Enter select · Esc close
 *            type letters to jump (typeahead) · Backspace removes last chip / clears.
 *  Features: search with match highlighting, groups, descriptions, icons, disabled
 *            options, chips for multi-select, max selections, loading & empty states.
 */
export function Dropdown<V extends DropdownValue = string>(props: DropdownProps<V>) {
  const {
    id: idProp,
    label,
    hideLabel,
    helperText,
    error,
    required,
    optional,
    size = 'md',
    labelAction,
    className,
    options,
    placeholder = 'Select…',
    searchable = false,
    searchPlaceholder = 'Search…',
    clearable = false,
    disabled,
    loading,
    emptyMessage = 'No options',
    name,
    onOpen,
  } = props

  const controlRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const typeahead = useRef({ text: '', timer: 0 })

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)

  const { id, labelId, helperId, errorId, describedBy } = useFieldIds(idProp, {
    hasHelper: Boolean(helperText),
    hasError: Boolean(error),
  })
  const listboxId = `${id}-listbox`
  const optionId = (i: number) => `${id}-opt-${i}`

  const selectedValues: V[] = props.multiple ? props.value : props.value == null ? [] : [props.value]
  const isSelected = (v: V) => selectedValues.includes(v)
  const selectedOptions = selectedValues
    .map((v) => options.find((o) => o.value === v))
    .filter((o): o is DropdownOption<V> => Boolean(o))
  const filtered = filterOptions(options, query)
  const atMax = props.multiple && props.maxSelected !== undefined && props.value.length >= props.maxSelected

  // Keep the highlighted option scrolled into view inside the menu.
  useEffect(() => {
    if (!open || activeIndex < 0) return
    listRef.current?.querySelector(`#${CSS.escape(optionId(activeIndex))}`)?.scrollIntoView({ block: 'nearest' })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- optionId only depends on id
  }, [open, activeIndex])

  useEffect(() => {
    if (open && searchable) searchRef.current?.focus({ preventScroll: true })
  }, [open, searchable])

  const openMenu = (at: 'selected' | 'last' = 'selected') => {
    if (disabled) return
    setQuery('')
    const selectedIndex = options.findIndex((o) => isSelected(o.value) && !o.disabled)
    setActiveIndex(at === 'last' ? firstEnabled(options, options.length - 1, -1) : selectedIndex >= 0 ? selectedIndex : firstEnabled(options))
    setOpen(true)
    onOpen?.()
  }

  const closeMenu = (refocus = true) => {
    setOpen(false)
    setActiveIndex(-1)
    if (refocus) triggerRef.current?.focus()
  }

  const toggleValue = (option: DropdownOption<V>) => {
    if (option.disabled) return
    if (props.multiple) {
      if (isSelected(option.value)) props.onChange(props.value.filter((v) => v !== option.value))
      else if (!atMax) props.onChange([...props.value, option.value])
      return // multi-select stays open
    }
    props.onChange(option.value)
    closeMenu()
  }

  const clearAll = () => {
    if (props.multiple) props.onChange([])
    else props.onChange(null)
  }

  const removeValue = (value: V) => {
    if (props.multiple) props.onChange(props.value.filter((v) => v !== value))
  }

  const moveActive = (dir: 1 | -1) => {
    if (!filtered.length) return
    let i = activeIndex
    for (let step = 0; step < filtered.length; step++) {
      i = (i + dir + filtered.length) % filtered.length // wrap around
      if (!filtered[i]!.disabled) return setActiveIndex(i)
    }
  }

  /** Type "ma" quickly to jump to "Maharashtra" — like a native <select>. */
  const runTypeahead = (char: string) => {
    const state = typeahead.current
    window.clearTimeout(state.timer)
    state.text += char.toLowerCase()
    state.timer = window.setTimeout(() => (state.text = ''), 600)
    const match = options.findIndex((o) => !o.disabled && o.label.toLowerCase().startsWith(state.text))
    if (match < 0) return
    if (open) setActiveIndex(match)
    else if (!props.multiple) props.onChange(options[match]!.value)
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (disabled) return
    const isChar = e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey

    if (!open) {
      if (['ArrowDown', 'Enter', ' '].includes(e.key)) {
        e.preventDefault()
        openMenu()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        openMenu('last')
      } else if (e.key === 'Backspace' && selectedValues.length) {
        if (props.multiple) removeValue(props.value[props.value.length - 1]!)
        else if (clearable) clearAll()
      } else if (isChar && !searchable) {
        runTypeahead(e.key)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        moveActive(1)
        break
      case 'ArrowUp':
        e.preventDefault()
        moveActive(-1)
        break
      case 'Home':
      case 'End':
        if (searchable) break // let the search input move its caret
        e.preventDefault()
        setActiveIndex(e.key === 'Home' ? firstEnabled(filtered) : firstEnabled(filtered, filtered.length - 1, -1))
        break
      case 'Enter':
        e.preventDefault()
        if (filtered[activeIndex]) toggleValue(filtered[activeIndex])
        break
      case ' ':
        if (searchable) break // typing a space in the search box
        e.preventDefault()
        if (filtered[activeIndex]) toggleValue(filtered[activeIndex])
        break
      case 'Tab':
        // The menu lives in a portal at the end of <body>; return focus to the trigger
        // first so Tab continues from there instead of jumping to the browser chrome.
        closeMenu()
        break
      default:
        if (isChar && !searchable) runTypeahead(e.key)
    }
  }

  // Render options, inserting a group heading whenever the group changes.
  const renderedOptions: ReactNode[] = []
  let lastGroup: string | undefined
  filtered.forEach((option, i) => {
    if (option.group && option.group !== lastGroup) {
      renderedOptions.push(
        <li key={`group-${option.group}`} role="presentation" className="menu__group">
          {option.group}
        </li>,
      )
    }
    lastGroup = option.group
    const selected = isSelected(option.value)
    const blocked = option.disabled || (atMax && !selected)
    renderedOptions.push(
      <li
        key={String(option.value)}
        id={optionId(i)}
        role="option"
        aria-selected={selected}
        aria-disabled={blocked || undefined}
        className="menu__option"
        data-active={i === activeIndex || undefined}
        onMouseMove={() => i !== activeIndex && !option.disabled && setActiveIndex(i)}
        onMouseDown={(e) => e.preventDefault()} // don't steal focus from trigger/search
        onClick={() => !blocked && toggleValue(option)}
      >
        {props.multiple ? (
          <span className="menu__check" data-checked={selected || undefined} aria-hidden="true">
            {selected && <Icon name="check" size={12} strokeWidth={3} />}
          </span>
        ) : null}
        {option.icon && <span className="menu__icon">{option.icon}</span>}
        <span className="menu__text">
          <span className="menu__label">
            <Highlight text={option.label} query={query} />
          </span>
          {option.description && <span className="menu__desc">{option.description}</span>}
        </span>
        {!props.multiple && selected && <Icon name="check" size={16} className="menu__tick" />}
      </li>,
    )
  })

  const activeDescendant = open && activeIndex >= 0 && filtered[activeIndex] ? optionId(activeIndex) : undefined
  const showClear = clearable && selectedValues.length > 0 && !disabled

  return (
    <FieldShell
      id={id}
      labelId={labelId}
      helperId={helperId}
      errorId={errorId}
      label={label}
      hideLabel={hideLabel}
      helperText={helperText}
      error={error}
      required={required}
      optional={optional}
      labelAction={labelAction}
      className={className}
      onLabelClick={() => triggerRef.current?.focus()}
    >
      <div
        ref={controlRef}
        className="control control--select"
        data-size={size}
        data-invalid={error ? true : undefined}
        data-disabled={disabled || undefined}
        data-open={open || undefined}
      >
        <div
          ref={triggerRef}
          id={id}
          role="combobox"
          tabIndex={disabled ? -1 : 0}
          className="control__trigger"
          aria-labelledby={label ? labelId : undefined}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={searchable ? undefined : activeDescendant}
          aria-disabled={disabled || undefined}
          aria-invalid={error ? true : undefined}
          aria-required={required || undefined}
          aria-describedby={describedBy}
          onClick={() => (open ? closeMenu() : openMenu())}
          onKeyDown={onKeyDown}
        >
          {selectedOptions.length === 0 ? (
            <span className="control__placeholder">{placeholder}</span>
          ) : props.multiple ? (
            <span className="chips">
              {selectedOptions.slice(0, MAX_CHIPS).map((o) => (
                <span key={String(o.value)} className="chip">
                  {o.label}
                  <span
                    className="chip__remove"
                    aria-hidden="true"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeValue(o.value)
                    }}
                  >
                    <Icon name="x" size={12} strokeWidth={2.5} />
                  </span>
                </span>
              ))}
              {selectedOptions.length > MAX_CHIPS && <span className="chip chip--more">+{selectedOptions.length - MAX_CHIPS}</span>}
              <span className="sr-only">{selectedOptions.map((o) => o.label).join(', ')} selected</span>
            </span>
          ) : (
            <span className="control__value">
              {selectedOptions[0]!.icon}
              {selectedOptions[0]!.label}
            </span>
          )}
        </div>
        {showClear && (
          <button type="button" className="control__btn" tabIndex={-1} aria-label="Clear selection" onClick={clearAll}>
            <Icon name="x" size={15} />
          </button>
        )}
        <span className="control__chevron" data-open={open || undefined} aria-hidden="true">
          <Icon name="chevronDown" size={16} />
        </span>
        {name && selectedValues.map((v) => <input key={String(v)} type="hidden" name={name} value={String(v)} />)}
      </div>

      <Popover open={open} anchorRef={controlRef} onClose={(reason) => closeMenu(reason === 'escape')} className="menu">
        {searchable && (
          <div className="menu__search">
            <Icon name="search" size={15} />
            <input
              ref={searchRef}
              role="combobox"
              aria-label={searchPlaceholder}
              aria-controls={listboxId}
              aria-expanded="true"
              aria-autocomplete="list"
              aria-activedescendant={activeDescendant}
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActiveIndex(firstEnabled(filterOptions(options, e.target.value)))
              }}
              onKeyDown={onKeyDown}
            />
          </div>
        )}
        <ul ref={listRef} id={listboxId} role="listbox" aria-multiselectable={props.multiple || undefined} aria-labelledby={label ? labelId : undefined} className="menu__list">
          {loading ? (
            <li className="menu__status" role="presentation">
              <Spinner size={16} /> Loading…
            </li>
          ) : filtered.length === 0 ? (
            <li className="menu__status" role="presentation">
              {query ? `No results for “${query}”` : emptyMessage}
            </li>
          ) : (
            renderedOptions
          )}
        </ul>
        {props.multiple && !loading && (
          <div className="menu__footer">
            <span>
              {props.value.length} selected{props.maxSelected !== undefined && ` · max ${props.maxSelected}`}
            </span>
            {props.value.length > 0 && (
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={clearAll}>
                Clear all
              </button>
            )}
          </div>
        )}
      </Popover>
    </FieldShell>
  )
}
