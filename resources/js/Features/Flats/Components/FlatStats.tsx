import Card from "@/Components/ui/Card/Card";

interface Props {
    stats?: {
        occupancy_rate?: number;
        pending_assignments?: number;
        rent_renewals?: number;
        top_tower?: string;
    };
}

export default function FlatStats({
    stats,
}: Props) {

    const cards = [
        {
            title: "Occupancy Rate",
            value: `${stats?.occupancy_rate || 0}%`,
            subtitle: "~1.2%",
            subtitleClass:
                "text-emerald-600",
        },

        {
            title: "Pending Assignments",
            value:
                stats?.pending_assignments || 0,
            subtitle:
                "units vacant",
            subtitleClass:
                "text-slate-500",
        },

        {
            title: "Rent Renewals",
            value:
                stats?.rent_renewals || 0,
            subtitle:
                "Due soon",
            subtitleClass:
                "text-rose-600",
        },

        {
            title: "Tower with Highest ROI",
            value:
                stats?.top_tower || "N/A",
            subtitle:
                "PREMIUM",
            subtitleClass:
                "bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-semibold",
        },
    ];

    return (
        <div className="grid grid-cols-4 gap-5">
            {cards.map((card) => (
                <Card
                    key={card.title}
                    className="
                        p-5
                        min-h-[110px]
                        flex
                        flex-col
                        justify-between
                    "
                >
                    {/* Title */}
                    <p className="
                        text-sm
                        text-slate-500
                        font-medium
                    ">
                        {card.title}
                    </p>

                    {/* Bottom */}
                    <div className="
                        flex
                        items-end
                        justify-between
                        mt-4
                    ">
                        <h3 className="
                            text-4xl
                            font-bold
                            tracking-tight
                            text-slate-900
                        ">
                            {card.value}
                        </h3>

                        <span
                            className={`
                                text-sm
                                font-medium
                                ${card.subtitleClass}
                            `}
                        >
                            {card.subtitle}
                        </span>
                    </div>
                </Card>
            ))}
        </div>
    );
}
