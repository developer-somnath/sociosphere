import Card from '@/Components/ui/Card/Card';

export default function QuickFilters() {
    return (
        <Card className="p-6 h-[300px]">

            <h3
                className="
                    text-sm
                    uppercase
                    tracking-wide
                    text-slate-500
                    font-semibold
                    mb-5
                "
            >
                Quick Filters
            </h3>

            <div className="space-y-4">

                <label className="flex items-center gap-3">

                    <input type="checkbox" />

                    <span>Dues Pending</span>

                </label>

                <label className="flex items-center gap-3">

                    <input type="checkbox" />

                    <span>Tenant Occupied</span>

                </label>

                <label className="flex items-center gap-3">

                    <input type="checkbox" />

                    <span>Recently Moved</span>

                </label>

            </div>

        </Card>
    );
}
