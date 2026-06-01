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
import { Flat } from "@/types/flat";

interface FlatTableProps {
    flats: Flat[];
    pagination: PaginatedResponse<Flat>
}

export default function FlatTable({
    flats,
    pagination,
}: FlatTableProps) {
    return (
        <Card className="overflow-hidden">

            <Table>

                <TableHeader>
                    <TableRow>

                        <TableCell header>
                            Flat No
                        </TableCell>

                        <TableCell header>
                            Tower / Block
                        </TableCell>

                        <TableCell header>
                            Type
                        </TableCell>

                        <TableCell header>
                            Owner Name
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

                    {flats.length > 0 ? (flats.map((flat) => (

                        <TableRow key={flat.id}>

                            <TableCell>
                                {flat.flat_no}
                            </TableCell>

                            <TableCell>
                                {flat.tower?.name}
                            </TableCell>

                            <TableCell>
                                {flat?.flat_type}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-3">

                                    <Avatar
                                        initials={flat?.resident?.name
                                            .split(" ")
                                            .map(v => v[0])
                                            .join("") || "N/A"
                                        }
                                    />

                                    <div>
                                        <div className="font-medium text-slate-900">
                                            {flat?.resident?.name}
                                        </div>

                                        <div className="text-xs text-slate-500">
                                            {flat?.resident?.email}
                                        </div>
                                    </div>

                                </div>
                            </TableCell>
                            <TableCell>

                                <Badge
                                    variant={
                                       flat?.occupancy_status === "Occupied"
                                        ? "success"
                                        : flat?.occupancy_status === "Vacant"
                                        ? "destructive"
                                        : "secondary"
                                    }
                                >
                                    {flat?.occupancy_status}
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
            {flats.length > 0 && (
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
