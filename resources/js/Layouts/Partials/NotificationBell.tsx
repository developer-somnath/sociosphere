import { Bell } from "lucide-react";

export default function NotificationBell() {
    return (
        <button className="relative">

            <Bell size={22} />

            <span
                className="
                    absolute
                    -right-1
                    top-0
                    h-2
                    w-2
                    rounded-full
                    bg-red-500
                "
            />

        </button>
    );
}
