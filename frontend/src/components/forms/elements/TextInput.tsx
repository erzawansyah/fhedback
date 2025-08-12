import type { Control } from "react-hook-form"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { FormIn } from "@/utils/survey-creation"

import type { Path } from "react-hook-form"
import HelperText from "./HelperText"

export default function TextInput({
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
                        <Input
                            required={required}
                            placeholder={placeholder}
                            {...attrs}
                            {...field}
                            value={
                                typeof field.value === "object" && field.value !== null
                                    ? "value" in field.value
                                        ? field.value.value
                                        : ""
                                    : field.value ?? ""
                            }
                        />
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
