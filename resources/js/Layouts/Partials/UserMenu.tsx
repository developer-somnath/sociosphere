import Avatar from "@/Components/ui/Avatar";
import { useAuth } from "@/Hooks/useAuth";

export default function UserMenu() {
    const user = useAuth().user;
    return (
        <div className="mt-auto">

                       <div className="flex items-center gap-3">

                            <Avatar
                                initials={user?.name
                                    .split(" ")
                                    .map(v => v[0])
                                    .join("") || "N/A"
                                }
                            />

                           <div>
                               <div>{user?.name}</div>
                               <div className="text-xs text-slate-500">
                                   {user?.role}
                               </div>
                           </div>

                       </div>

                   </div>
    );
}
