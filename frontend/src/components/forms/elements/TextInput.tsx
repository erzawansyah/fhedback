import { type Control, type FieldPath, type FieldValues, useController } from "react-hook-form";
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import HelperText from "./HelperText"

type TextInputProps<T extends FieldValues> = {
    control: Control<T>;
    name: FieldPath<T>;
    label?: string;
    description?: string;
    placeholder?: string;
    tooltip?: string;
    required?: boolean;
    attrs?: React.InputHTMLAttributes<HTMLInputElement>;
};

export default function TextInput<T extends FieldValues>({
    control,
    name,
    label,
    description,
    placeholder,
    required,
    tooltip,
    ...attrs
}: TextInputProps<T>) {
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

            {/* Pesan error utama di bawah field */}
            <FormMessage />
        </FormItem>
    );
}
