import Avatar from "@/Components/ui/Avatar/Avatar";
import Badge from "@/Components/ui/Badge/Badge";
import Card from "@/Components/ui/Card/Card";

import Table from "@/Components/ui/Table/Table";
import TableRow from "@/Components/ui/Table/TableRow";
import TableCell from "@/Components/ui/Table/TableCell";
import TableHeader from "@/Components/ui/Table/TableHeader";
import Pagination from "@/Components/ui/Pagination/Pagination";

import { Resident } from "@/types/resident";
import { PaginatedResponse } from "@/types/pagination";

import {
    Eye,
    Pencil,
    Trash2,
} from "lucide-react";

interface ResidentTableProps {
    residents: Resident[];
    pagination: PaginatedResponse<Resident>
}

export default function ResidentTable({
    residents,
    pagination,
}: ResidentTableProps) {
    return (
        <Card className="overflow-hidden">

            <Table>

                <TableHeader>
                    <TableRow>

                        <TableCell header>
                            Flat No
                        </TableCell>

                        <TableCell header>
                            Tower
                        </TableCell>

                        <TableCell header>
                            Resident Name
                        </TableCell>

                        <TableCell header>
                            Contact
                        </TableCell>

                        <TableCell header>
                            Ownership
                        </TableCell>

                        <TableCell header>
                            Status
                        </TableCell>

                        <TableCell header>
                            Actions
                        </TableCell>

                    </TableRow>
                </TableHeader>

                <tbody>

                    {residents.length > 0 ? (residents.map((resident) => (

                        <TableRow key={resident.id}>

                            <TableCell>
                                {resident.flat?.flat_no}
                            </TableCell>

                            <TableCell>
                                {resident.flat?.tower?.name}
                            </TableCell>

                            <TableCell>

                                <div className="flex items-center gap-3">

                                    <Avatar
                                        initials={resident.name
                                            .split(" ")
                                            .map(v => v[0])
                                            .join("")
                                        }
                                    />

                                    <div>
                                        <div className="font-medium text-slate-900">
                                            {resident.name}
                                        </div>

                                        <div className="text-xs text-slate-500">
                                            {resident.email}
                                        </div>
                                    </div>

                                </div>

                            </TableCell>

                            <TableCell>
                                {resident.phone}
                            </TableCell>

                            <TableCell>

                                <Badge variant="info">
                                    {resident.flat?.ownership_type}
                                </Badge>

                            </TableCell>

                            <TableCell>

                                <Badge
                                    variant={
                                        resident.flat?.occupancy_status === "Occupied"
                                            ? "success"
                                            : "default"
                                    }
                                >
                                    {resident.flat?.occupancy_status}
                                </Badge>

                            </TableCell>

                            <TableCell>

                                <div className="flex items-center gap-2">

                                    <button
                                        className="
                                            p-2
                                            rounded-md
                                            border
                                            border-slate-200
                                            hover:bg-slate-50
                                        "
                                    >
                                        <Eye size={16} />
                                    </button>

                                    <button
                                        className="
                                            p-2
                                            rounded-md
                                            border
                                            border-slate-200
                                            hover:bg-slate-50
                                        "
                                    >
                                        <Pencil size={16} />
                                    </button>

                                    <button
                                        className="
                                            p-2
                                            rounded-md
                                            border
                                            border-red-200
                                            text-red-600
                                            hover:bg-red-50
                                        "
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                </div>

                            </TableCell>

                        </TableRow>

                    ))) : (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center">
                                No residents found.
                            </TableCell>
                        </TableRow>
                    )}

                </tbody>

            </Table>
            {residents.length > 0 && (
            <div
                className="
                    flex
                    items-center
                    justify-between
                    border-t
                    border-slate-200
                    px-6
                    py-4
                "
            >

                <p className="text-sm text-slate-500">
                    Showing {pagination.from} to {pagination.to} of {pagination.total} entries
                </p>

                <Pagination
                    links={pagination.links}
                />

            </div>
            )}

        </Card>
    );
}
