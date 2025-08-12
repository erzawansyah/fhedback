import type { Control } from "react-hook-form"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { FormIn } from "@/utils/survey-creation"
import { useState } from "react"
import type { Path } from "react-hook-form"
import HelperText from "./HelperText"

export default function ArrayTextInput({
    control,
    name,
    label,
    description,
    placeholder,
    required,
    tooltip,
    ...attrs
}: {
    control: Control<FormIn>
    name: Path<FormIn>
    label?: string
    description?: string
    placeholder?: string
    tooltip?: string
    required?: boolean,
    attrs?: React.InputHTMLAttributes<HTMLInputElement>
}) {
    const defaultLabel = name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1').trim()
    const inputName: Path<FormIn> = name
    const [inputValue, setInputValue] = useState("")

    return (
        <FormField
            control={control}
            name={inputName}
            render={({ field }) => {
                // Get array from field value, ensuring it's always a string array
                const arrayValue: string[] = Array.isArray(field.value)
                    ? field.value.filter(item => typeof item === 'string')
                    : []

                const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = e.target.value
                    setInputValue(value)

                    // Convert comma-separated string to array
                    const newArray = value
                        .split(",")
                        .map(item => item.trim())
                        .filter(item => item.length > 0)

                    field.onChange(newArray)
                }

                const removeBadge = (indexToRemove: number) => {
                    const newArray = arrayValue.filter((_, index) => index !== indexToRemove)
                    field.onChange(newArray)
                    setInputValue(newArray.join(", "))
                }

                return (
                    <FormItem>
                        <FormLabel asChild className="flex items-center">
                            <div className="flex space-x-2">
                                <h4>
                                    {label ?? defaultLabel}
                                    {
                                        required && <span className="text-red-500 ml-1">*</span>
                                    }
                                </h4>
                                <FormMessage
                                    className="font-base italic text-xs"
                                />
                            </div>
                        </FormLabel>

                        <FormControl>
                            <div className="space-y-2">
                                <Input
                                    required={required}
                                    placeholder={placeholder || "Enter items separated by commas"}
                                    {...attrs}
                                    value={inputValue || (Array.isArray(field.value) ? field.value.join(", ") : "")}
                                    onChange={handleInputChange}
                                />
                                <DisplayTextArray
                                    items={arrayValue}
                                    onRemove={removeBadge}
                                />
                            </div>
                        </FormControl>
                        <FormDescription className="text-xs italic text-subtle flex items-center">
                            {description || "Separate multiple items with commas"}
                            {tooltip && <HelperText text={tooltip} />}
                        </FormDescription>
                    </FormItem>
                )
            }}
        />
    )
}


function DisplayTextArray(
    { items, onRemove }: { items: string[], onRemove: (index: number) => void }) {
    return (
        <div className="flex flex-wrap gap-2 mt-2">
            {items.map((item, index) => (
                <Badge
                    key={index}
                    variant="default"
                    className="cursor-context-menu"
                    onClick={() => onRemove(index)}
                >
                    {item}
                </Badge>
            ))}
        </div>
    )
}
