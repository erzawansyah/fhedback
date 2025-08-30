// SelectInput.tsx
import { type Control, type FieldPath, type FieldValues, useController } from "react-hook-form";
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import HelperText from "./HelperText";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";

type SelectInputProps<T extends FieldValues> = {
    control: Control<T>;
    name: FieldPath<T>;
    label?: string;
    description?: string;
    options: readonly string[] | string[];
    placeholder?: string;
    tooltip?: string;
    required?: boolean;
};

export default function SelectInput<T extends FieldValues>({
    control,
    name,
    label,
    description,
    options,
    placeholder,
    tooltip,
    required,
}: SelectInputProps<T>) {
    const { field } = useController({ control, name });

    const defaultLabel = String(name)
        .replace(/\.(\d+)\./g, " [$1] ") // rapikan indeks array
        .replace(/\./g, " ")
        .replace(/([A-Z])/g, " $1")
        .replace(/\b\w/g, l => l.toUpperCase())
        .trim();

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

            {/* Pola shadcn: Select di luar, FormControl hanya bungkus Trigger */}
            <Select
                onValueChange={field.onChange}
                value={field.value ?? undefined}   // penting agar terkontrol
                defaultValue={field.value ?? undefined}
            >
                <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder={placeholder || "Select an option"} />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    {options.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                            {opt.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {(description || tooltip) && (
                <div className="flex items-center gap-1">
                    {description && (
                        <FormDescription className="text-xs italic text-subtle">
                            {description}
                        </FormDescription>
                    )}
                    {tooltip && <HelperText text={tooltip} />}
                </div>
            )}

            {/* Pesan error utama di bawah field */}
            <FormMessage />
        </FormItem>
    );
}
