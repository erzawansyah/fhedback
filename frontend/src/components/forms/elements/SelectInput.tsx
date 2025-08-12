import type { Control } from "react-hook-form"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import type { FormIn } from "@/utils/survey-creation"

import type { Path } from "react-hook-form"
import HelperText from "./HelperText"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"

export default function SelectInput({
    control,
    name,
    label,
    description,
    options,
    placeholder,
    tooltip,
    required,
}: {
    control: Control<FormIn>
    name: Path<FormIn>
    label?: string
    description?: string
    options: readonly string[]
    placeholder?: string
    tooltip?: string
    required?: boolean
}) {
    const defaultLabel = name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1').trim()
    const inputName: Path<FormIn> = name



    return (
        <FormField
            control={control}
            name={inputName}
            render={({ field }) => (
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
                        <Select
                            onValueChange={field.onChange}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={placeholder || "Select an option"} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem disabled value="Select an option">
                                    {placeholder || "Select an option"}
                                </SelectItem>
                                {options.map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {option.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormControl>
                    <FormDescription className="text-xs italic text-subtle flex items-center">
                        {description}
                        {tooltip && <HelperText text={tooltip} />}
                    </FormDescription>
                </FormItem>
            )}
        />
    )
}
