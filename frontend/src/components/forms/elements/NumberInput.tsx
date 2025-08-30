import { type Control, type FieldPath, type FieldValues, useController } from "react-hook-form";
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import HelperText from "./HelperText"
import { Minus, Plus } from "lucide-react"

type NumberInputProps<T extends FieldValues> = {
    control: Control<T>;
    name: FieldPath<T>;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
    description?: string;
    placeholder?: string;
    tooltip?: string;
    required?: boolean;
};

export default function NumberInput<T extends FieldValues>({
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
}: NumberInputProps<T>) {
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
                <div>
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
                </div>
            </FormControl>
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
