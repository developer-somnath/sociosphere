import StatCard from "@/Components/Shared/StatCard";

export default function ResidentStats() {
    return (
        <div className="flex gap-4 ">

            <StatCard
                title="TOTAL FLATS"
                value="420"
            />

            <StatCard
                title="OCCUPIED"
                value="395"
                color="text-emerald-600"
            />

            <StatCard
                title="VACANT"
                value="25"
                color="text-blue-600"
            />

        </div>
    );
}
