import type { Control } from "react-hook-form"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { FormIn } from "@/utils/survey-creation"

import type { Path } from "react-hook-form"
import HelperText from "./HelperText"
import { Minus, Plus } from "lucide-react"

export default function NumberInput({
    control,
    name,
    label,
    description,
    placeholder,
    required,
    tooltip,
    step = 1,
    min = 1,
    max = 100,
    ...attrs
}: {
    control: Control<FormIn>
    name: Path<FormIn>
    min?: number
    max?: number
    step?: number
    label?: string
    description?: string
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
                        <>
                            {/* Hidden input disini */}
                            <input
                                type="hidden"
                                name={field.name}
                                value={typeof field.value === "string" || typeof field.value === "number" ? field.value : ""}
                            />
                            {/* Input untuk controll */}
                            <div className="flex items-center gap-2">
                                <Input
                                    required={required}
                                    placeholder={placeholder}
                                    type="number"
                                    className="flex-1"
                                    min={min}
                                    max={max}
                                    {...attrs}
                                    {...field}
                                    value={
                                        typeof field.value === "object" && field.value !== null
                                            ? "value" in field.value
                                                ? field.value.value
                                                : ""
                                            : field.value ?? ""
                                    }
                                    onChange={(e) => {
                                        const value = e.target.value === "" ? "" : Number(e.target.value);
                                        field.onChange(value);
                                    }}
                                />
                                <div className="flex items-center gap-1">
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="noShadow"
                                        className="rounded-full p-0"
                                        onClick={() => {
                                            const currentValue = Number(field.value) || 1;
                                            field.onChange(Math.max(0, currentValue - step));
                                        }}
                                    >
                                        <Minus />
                                    </Button>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="noShadow"
                                        className="rounded-full p-0"
                                        onClick={() => {
                                            const currentValue = Number(field.value) || 0;
                                            field.onChange(currentValue + step);
                                        }}
                                    >
                                        <Plus />
                                    </Button>
                                </div>
                            </div>
                        </>
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
