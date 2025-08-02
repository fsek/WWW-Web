"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface ComboboxOption {
  value: string
  label: React.ReactNode
}

interface ComboboxProps {
  options: ComboboxOption[]
  value: string | null
  onChange: (value: string | null) => void
  inputValue?: string
  onInputChange?: (value: string) => void
  placeholder?: string
  clearable?: boolean
  renderOption?: (option: ComboboxOption) => React.ReactNode
  inputProps?: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>
  noOptionsMessage?: () => React.ReactNode
  className?: string
}

export function Combobox({
  options,
  value,
  onChange,
  inputValue,
  onInputChange,
  placeholder = "Select...",
  clearable = false,
  renderOption,
  inputProps,
  noOptionsMessage,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [internalInput, setInternalInput] = React.useState("")
  const isControlled = typeof inputValue === "string" && typeof onInputChange === "function"
  const currentInput = isControlled ? inputValue! : internalInput

  const handleInputChange = (val: string) => {
    if (isControlled) {
      onInputChange!(val)
    } else {
      setInternalInput(val)
    }
  }

  const selectedOption = value
    ? options.find((option) => option.value === value)
    : null

  const showClear = clearable && value

  return (
    <div className="relative w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between", className)}
          >
            <span className={cn(!value && "text-gray-500")}>
              {selectedOption
                ? selectedOption.label
                : currentInput
                  ? currentInput
                  : placeholder}
            </span>
            <span className="flex items-center gap-1">
              <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full min-w-[200px] p-0">
          <Command>
            <CommandInput
              placeholder={placeholder}
              value={currentInput}
              onValueChange={handleInputChange}
              {...inputProps}
            />
            <CommandList>
              <CommandEmpty>
                {noOptionsMessage ? noOptionsMessage() : "No options found."}
              </CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue) => {
                      if (currentValue === value) {
                        onChange(null)
                      } else {
                        onChange(currentValue)
                      }
                      setOpen(false)
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {renderOption ? renderOption(option) : option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {showClear && (
        <button
          type="button"
          tabIndex={-1}
          aria-label="Clear"
          className="absolute right-10 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-destructive focus:bg-destructive hover:text-destructive-foreground focus:text-destructive-foreground"
          onClick={e => {
            e.preventDefault()
            e.stopPropagation()
            handleInputChange("")
            onChange(null)
            setOpen(false)
          }}
        >
          <XIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}