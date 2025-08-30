import { type Control, type FieldPath, type FieldValues, useController } from "react-hook-form";
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import HelperText from "./HelperText"

type ArrayTextInputProps<T extends FieldValues> = {
    control: Control<T>;
    name: FieldPath<T>;
    label?: string;
    description?: string;
    placeholder?: string;
    tooltip?: string;
    required?: boolean;
    attrs?: React.InputHTMLAttributes<HTMLInputElement>;
};

export default function ArrayTextInput<T extends FieldValues>({
    control,
    name,
    label,
    description,
    placeholder,
    required,
    tooltip,
    ...attrs
}: ArrayTextInputProps<T>) {
    const { field } = useController({ control, name });

    const defaultLabel = String(name)
        .replace(/\.(\d+)\./g, " [$1] ") // rapikan indeks array
        .replace(/\./g, " ")
        .replace(/([A-Z])/g, " $1")
        .replace(/\b\w/g, l => l.toUpperCase())
        .trim();

    const [inputValue, setInputValue] = useState("")

    // Get array from field value, ensuring it's always a string array
    const arrayValue: string[] = Array.isArray(field.value)
        ? field.value.filter((item: unknown) => typeof item === 'string')
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
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </h4>
                    {/* Pesan error singkat di label, opsional */}
                    <FormMessage className="font-base italic text-xs" />
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
            <div className="flex items-center gap-1">
                <FormDescription className="text-xs italic text-subtle">
                    {description || "Separate multiple items with commas"}
                </FormDescription>
                {tooltip && <HelperText text={tooltip} />}
            </div>

            {/* Pesan error utama di bawah field */}
            <FormMessage />
        </FormItem>
    );
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
