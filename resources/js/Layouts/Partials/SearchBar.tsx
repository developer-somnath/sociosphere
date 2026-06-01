import { Search } from "lucide-react";

interface Props {
    placeholder?: string;
}

export default function SearchBar({
    placeholder = "Search residents, bills, or transactions...",
}: Props) {
    return (
        <div className="relative w-full max-w-2xl">

            <Search
                size={18}
                className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-gray-400
                "
            />

            <input
                type="text"
                placeholder={placeholder}
                className="
                    w-full
                    rounded-lg
                    border
                    bg-slate-100
                    py-3
                    pl-12
                    pr-4
                    h-12
                "
            />

        </div>
    );
}
