"use client"

import * as React from "react"
import { FieldPath, FieldValues } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { cn } from "@/lib/shadcn/utils"
import {
    TextFieldProps,
    NumberFieldProps,
    TextareaFieldProps,
    SelectFieldProps,
    FormSectionProps,
    FormGridProps
} from "../types"
import { GRID_COLUMNS } from "../constants"

// Text input field component
export function TextField<T extends FieldValues>({
    control,
    name,
    label,
    placeholder,
    type = "text",
    disabled = false,
    className
}: TextFieldProps<T>) {
    return (
        <FormField
            control={control}
            name={name as FieldPath<T>}
            render={({ field }) => (
                <FormItem className={className}>
                    <FormLabel className="font-mono text-foreground">{label}</FormLabel>
                    <FormControl>
                        <Input
                            placeholder={placeholder}
                            disabled={disabled}
                            type={type}
                            className={cn(
                                "border-2 border-border bg-background text-foreground",
                                "focus-visible:ring-2 focus-visible:ring-border",
                                "font-mono"
                            )}
                            {...field}
                            onChange={(e) => {
                                const value = e.target.value
                                if (type === "number") {
                                    field.onChange(value === "" ? 0 : Number(value))
                                } else {
                                    field.onChange(value)
                                }
                            }}
                        />
                    </FormControl>
                    <FormMessage className="font-mono text-xs" />
                </FormItem>
            )}
        />
    )
}

// Number input field component
export function NumberField<T extends FieldValues>({
    control,
    name,
    label,
    placeholder,
    min,
    max,
    step,
    disabled = false,
    className
}: NumberFieldProps<T>) {
    return (
        <FormField
            control={control}
            name={name as FieldPath<T>}
            render={({ field }) => (
                <FormItem className={className}>
                    <FormLabel className="font-mono text-foreground">{label}</FormLabel>
                    <FormControl>
                        <Input
                            placeholder={placeholder}
                            disabled={disabled}
                            type="number"
                            min={min}
                            max={max}
                            step={step}
                            className={cn(
                                "border-2 border-border bg-background text-foreground",
                                "focus-visible:ring-2 focus-visible:ring-border",
                                "font-mono"
                            )}
                            {...field}
                            onChange={(e) => {
                                const value = e.target.value
                                field.onChange(value === "" ? 0 : Number(value))
                            }}
                        />
                    </FormControl>
                    <FormMessage className="font-mono text-xs" />
                </FormItem>
            )}
        />
    )
}

// Textarea field component
export function TextareaField<T extends FieldValues>({
    control,
    name,
    label,
    placeholder,
    rows = 3,
    disabled = false,
    className
}: TextareaFieldProps<T>) {
    return (
        <FormField
            control={control}
            name={name as FieldPath<T>}
            render={({ field }) => (
                <FormItem className={className}>
                    <FormLabel className="font-mono text-foreground">{label}</FormLabel>
                    <FormControl>
                        <Textarea
                            placeholder={placeholder}
                            disabled={disabled}
                            rows={rows}
                            className={cn(
                                "border-2 border-border bg-background text-foreground",
                                "focus-visible:ring-2 focus-visible:ring-border",
                                "font-mono resize-none"
                            )}
                            {...field}
                        />
                    </FormControl>
                    <FormMessage className="font-mono text-xs" />
                </FormItem>
            )}
        />
    )
}

// Select field component
export function SelectField<T extends FieldValues>({
    control,
    name,
    label,
    options,
    placeholder,
    disabled = false,
    className
}: SelectFieldProps<T>) {
    return (
        <FormField
            control={control}
            name={name as FieldPath<T>}
            render={({ field }) => (
                <FormItem className={className}>
                    <FormLabel className="font-mono text-foreground">{label}</FormLabel>
                    <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={disabled}
                    >
                        <FormControl>
                            <SelectTrigger className={cn(
                                "border-2 border-border bg-background text-foreground",
                                "focus:ring-2 focus:ring-border",
                                "font-mono"
                            )}>
                                <SelectValue
                                    placeholder={placeholder}
                                    className="font-mono text-foreground/70"
                                />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent className="border-2 border-border bg-background">
                            {options.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                    className="font-mono text-foreground hover:bg-secondary-background"
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage className="font-mono text-xs" />
                </FormItem>
            )}
        />
    )
}

// Form section wrapper
export function FormSection({
    title,
    description,
    children,
    className
}: FormSectionProps) {
    return (
        <div className={cn("space-y-4", className)}>
            {title && (
                <div className="space-y-2">
                    <h3 className="text-lg font-sans text-foreground font-bold">{title}</h3>
                    {description && (
                        <p className="text-sm font-mono text-foreground/70">{description}</p>
                    )}
                </div>
            )}
            <div className="space-y-4">
                {children}
            </div>
        </div>
    )
}

// Form grid layout
export function FormGrid({
    children,
    columns = 1,
    className
}: FormGridProps) {
    return (
        <div className={cn(
            "grid gap-4",
            GRID_COLUMNS[columns],
            className
        )}>
            {children}
        </div>
    )
}
