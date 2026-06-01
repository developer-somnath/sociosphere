import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";

interface Wing {
    id: number;
    name: string;
}

interface FlatFormProps {
    data: any;
    setData: (key: string, value: any) => void;
    wings: Wing[];
    errors?: Record<string, string>;
}

export default function FlatForm({
    data,
    setData,
    wings,
    errors = {},
}: FlatFormProps) {
    return (
        <div className="space-y-6">

            <Card>
                <CardHeader>
                    <CardTitle>
                        Flat Information
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">

                        <div>
                            <Label>Wing *</Label>

                            <Select
                                value={data.wing_id?.toString()}
                                onValueChange={(value) =>
                                    setData("wing_id", Number(value))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Wing" />
                                </SelectTrigger>

                                <SelectContent>
                                    {wings.map((wing) => (
                                        <SelectItem
                                            key={wing.id}
                                            value={wing.id.toString()}
                                        >
                                            {wing.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {errors.wing_id && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.wing_id}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label>Flat Number *</Label>

                            <Input
                                value={data.flat_number}
                                onChange={(e) =>
                                    setData("flat_number", e.target.value)
                                }
                                placeholder="101"
                            />
                        </div>

                        <div>
                            <Label>Floor</Label>

                            <Input
                                type="number"
                                value={data.floor}
                                onChange={(e) =>
                                    setData("floor", e.target.value)
                                }
                            />
                        </div>

                        <div>
                            <Label>Flat Type</Label>

                            <Select
                                value={data.flat_type}
                                onValueChange={(value) =>
                                    setData("flat_type", value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Type" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="1 BHK">1 BHK</SelectItem>
                                    <SelectItem value="2 BHK">2 BHK</SelectItem>
                                    <SelectItem value="3 BHK">3 BHK</SelectItem>
                                    <SelectItem value="4 BHK">4 BHK</SelectItem>
                                    <SelectItem value="Penthouse">
                                        Penthouse
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Carpet Area (Sq Ft)</Label>

                            <Input
                                type="number"
                                value={data.carpet_area}
                                onChange={(e) =>
                                    setData("carpet_area", e.target.value)
                                }
                            />
                        </div>

                        <div>
                            <Label>Super Built-up Area (Sq Ft)</Label>

                            <Input
                                type="number"
                                value={data.super_builtup_area}
                                onChange={(e) =>
                                    setData(
                                        "super_builtup_area",
                                        e.target.value
                                    )
                                }
                            />
                        </div>

                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>
                        Occupancy Information
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <Select
                        value={data.occupancy_status}
                        onValueChange={(value) =>
                            setData("occupancy_status", value)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Status" />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="vacant">
                                Vacant
                            </SelectItem>

                            <SelectItem value="owner_occupied">
                                Owner Occupied
                            </SelectItem>

                            <SelectItem value="tenant_occupied">
                                Tenant Occupied
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>
                        Maintenance
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <Input
                        type="number"
                        value={data.maintenance_amount}
                        onChange={(e) =>
                            setData(
                                "maintenance_amount",
                                e.target.value
                            )
                        }
                        placeholder="3500"
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>
                        Notes
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <Textarea
                        value={data.notes}
                        onChange={(e) =>
                            setData("notes", e.target.value)
                        }
                    />
                </CardContent>
            </Card>

        </div>
    );
}
