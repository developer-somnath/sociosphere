interface Props {
    towers: string[];
    activeTower: string;
    onChange: (tower: string) => void;
}

export default function TowerTabs({
    towers,
    activeTower,
    onChange,
}: Props) {
    return (
        <div className="mb-6 flex gap-2">

            {towers.map((tower) => (

                <button
                    key={tower}
                    onClick={() => onChange(tower)}
                    className={`
                        px-5
                        py-2
                        rounded-lg
                        border
                        text-sm
                        font-medium
                        transition

                        ${
                            activeTower === tower
                                ? 'bg-slate-100 border-slate-300 text-slate-900'
                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }
                    `}
                >
                    {tower}
                </button>

            ))}

        </div>
    );
}
