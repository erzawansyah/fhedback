"use client"
import React from 'react'
import { Button } from './ui/button'
import { useUI } from '@/context/UIContext'
import { Moon, Sun } from 'lucide-react'

const ThemeSwitcher = () => {
    const { toggleTheme } = useUI()

    return (
        <Button size={"icon"} variant={"default"} onClick={toggleTheme} className="relative overflow-hidden cursor-pointer">
            <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-in-out
                opacity-100 scale-100
                dark:opacity-0 dark:scale-90
                ">
                <Sun className="transition-transform duration-300 ease-in-out" />
            </span>
            <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-in-out
                opacity-0 scale-90
                dark:opacity-100 dark:scale-100
                ">
                <Moon className="transition-transform duration-300 ease-in-out" />
            </span>
            {/* Untuk aksesibilitas, bisa tambahkan span sr-only */}
            <span className="sr-only">Ganti tema</span>
        </Button>
    )
}

export default ThemeSwitcher
