import { type Control, type FieldPath, type FieldValues, useController } from "react-hook-form";
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "../../ui/textarea"
import HelperText from "./HelperText"

type TextAreaInputProps<T extends FieldValues> = {
    control: Control<T>;
    name: FieldPath<T>;
    label?: string;
    description?: string;
    placeholder?: string;
    tooltip?: string;
    required?: boolean;
    rows?: number;
    attrs?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
};

export default function TextAreaInput<T extends FieldValues>({
    control,
    name,
    label,
    description,
    placeholder,
    required,
    tooltip,
    rows = 4,
    attrs
}: TextAreaInputProps<T>) {
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

            {/* Pesan error utama di bawah field */}
            <FormMessage />
        </FormItem>
    );
}


