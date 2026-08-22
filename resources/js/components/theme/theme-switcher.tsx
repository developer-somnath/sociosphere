import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function ThemeSwitcher() {
    const [mounted, setMounted] = useState(false);
    const { t } = useI18n();
    const { theme, setTheme, resolvedTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Avoid hydration mismatch — render a placeholder until mounted
    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" className="size-8 rounded-lg" aria-label={t("ui.toggleTheme")}>
                <Sun className="size-4 opacity-0" />
            </Button>
        );
    }

    const isDark = resolvedTheme === "dark";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                    aria-label={t("ui.toggleTheme")}
                >
                    {isDark ? (
                        <Moon className="size-4" />
                    ) : (
                        <Sun className="size-4" />
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-36 rounded-xl">
                <DropdownMenuItem
                    onClick={() => setTheme("light")}
                    className={cn(theme === "light" && "bg-accent font-medium")}
                >
                    <Sun className="size-4" />
                    {t("ui.light")}
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => setTheme("dark")}
                    className={cn(theme === "dark" && "bg-accent font-medium")}
                >
                    <Moon className="size-4" />
                    {t("ui.dark")}
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => setTheme("system")}
                    className={cn(theme === "system" && "bg-accent font-medium")}
                >
                    <Monitor className="size-4" />
                    {t("ui.system")}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
