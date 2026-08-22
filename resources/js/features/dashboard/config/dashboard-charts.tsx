import { Cell, Pie, PieChart, Bar, BarChart, XAxis, YAxis, Tooltip } from "recharts";

import {
    ChartContainer,
    ChartLegend,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import type { DashboardStats } from "@/types";

const occupancyConfig: ChartConfig = {
    occupied: { label: "Occupied", color: "var(--color-brand)" },
    vacant: { label: "Vacant", color: "var(--color-muted)" },
};

const portfolioConfig: ChartConfig = {
    value: { label: "Count", color: "var(--color-info)" },
};

export function OccupancyCompositionCard({ stats }: { stats: DashboardStats }) {
    const { t } = useI18n();
    const vacant = Math.max(0, stats.flats - stats.occupied_flats);
    const data = [
        { key: "occupied", name: t("dashboard.occupiedUnits"), value: stats.occupied_flats },
        { key: "vacant", name: t("dashboard.vacantUnitsLabel"), value: vacant },
    ];

    return (
        <Card className="border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-foreground">
                    {t("dashboard.occupancyComposition")}
                </CardTitle>
                <p className="mt-0.5 text-xs text-muted-foreground">
                    {t("dashboard.occupancyCompositionDesc")}
                </p>
            </CardHeader>
            <CardContent>
                <ChartContainer config={occupancyConfig} className="h-56">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={2}
                            stroke="none"
                        >
                            {data.map((entry) => (
                                <Cell
                                    key={entry.key}
                                    fill={
                                        entry.key === "occupied"
                                            ? "var(--color-brand)"
                                            : "var(--color-muted)"
                                    }
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<ChartTooltipContent config={occupancyConfig} />} />
                    </PieChart>
                </ChartContainer>
                <ChartLegend config={occupancyConfig} className="mt-2 justify-center" />
            </CardContent>
        </Card>
    );
}

export function PortfolioSnapshotCard({ stats }: { stats: DashboardStats }) {
    const { t } = useI18n();
    const data = [
        { metric: t("dashboard.metricResidents"), value: stats.residents },
        { metric: t("dashboard.metricFlats"), value: stats.flats },
        { metric: t("dashboard.metricComplaints"), value: stats.open_complaints },
        { metric: t("dashboard.metricNotices"), value: stats.active_notices },
    ];

    return (
        <Card className="border-border/70 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-foreground">
                    {t("dashboard.portfolioSnapshot")}
                </CardTitle>
                <p className="mt-0.5 text-xs text-muted-foreground">
                    {t("dashboard.portfolioSnapshotDesc")}
                </p>
            </CardHeader>
            <CardContent>
                <ChartContainer config={portfolioConfig} className="h-56">
                    <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                        <XAxis
                            dataKey="metric"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                            allowDecimals={false}
                        />
                        <Tooltip content={<ChartTooltipContent config={portfolioConfig} />} />
                        <Bar dataKey="value" fill="var(--color-info)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
