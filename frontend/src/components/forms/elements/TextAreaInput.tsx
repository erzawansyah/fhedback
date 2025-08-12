import type { Control } from "react-hook-form"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import type { FormIn } from "@/utils/survey-creation"

import type { Path } from "react-hook-form"
import { Textarea } from "../../ui/textarea"
import HelperText from "./HelperText"

export default function TextAreaInput({
    control,
    name,
    label,
    description,
    placeholder,
    required,
    tooltip,
    rows = 4,
    attrs
}: {
    control: Control<FormIn>
    name: Path<FormIn>
    label?: string
    description?: string
    placeholder?: string
    tooltip?: string
    required?: boolean,
    rows?: number,
    attrs?: React.TextareaHTMLAttributes<HTMLTextAreaElement>
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
                        <Textarea
                            required={required}
                            placeholder={placeholder}
                            rows={rows}
                            {...field}
                            {...attrs}
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


