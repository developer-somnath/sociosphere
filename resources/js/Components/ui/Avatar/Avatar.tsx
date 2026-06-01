interface Props {
    initials: string;
}

export default function Avatar({
    initials,
}: Props) {
    return (
        <div
            className="
                w-11
                h-11
                rounded-full
                bg-slate-200
                flex
                items-center
                justify-center
                font-semibold
                text-sm
                text-slate-700

            "
        >
            {initials}
        </div>
    );
}
