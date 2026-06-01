import Card from "@/Components/ui/Card/Card";

interface Props {
    title: string;
    value: string;
    color?: string;
}

export default function StatCard({
    title,
    value,
    color = "text-slate-800",
}: Props) {
    return (
        <Card className="w-[150px] h-[90px] p-5">

            <p
                className={`
                    text-xs
                    font-semibold
                    uppercase
                    mb-2
                    ${color}
                `}
            >
                {title}
            </p>

            <h3 className="text-4xl font-bold tracking-tight">
                {value}
            </h3>

        </Card>
    );
}
