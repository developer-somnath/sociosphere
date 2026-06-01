import SearchBar from "./SearchBar";
import NotificationBell from "./NotificationBell";
import UserMenu from "./UserMenu";

export default function Topbar() {
    return (
        <header
            className="
                flex
                items-center
                justify-between
                border-b
                bg-white
                px-6
                py-4
            "
        >
            <SearchBar />

            <div className="flex items-center gap-6">

                <NotificationBell />

                <UserMenu />

            </div>

        </header>
    );
}
