import { useForm } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import FlatForm from "../Components/FlatForm";

export default function CreateFlat({ wings }) {

    const { data, setData, post, processing, errors } = useForm({
        wing_id: "",
        flat_number: "",
        floor: "",
        flat_type: "",
        carpet_area: "",
        super_builtup_area: "",
        occupancy_status: "vacant",
        maintenance_amount: "",
        notes: "",
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route("flats.store"));
    };

    return (
        <DashboardLayout>

            <form onSubmit={submit}>

                <FlatForm
                    data={data}
                    setData={setData}
                    wings={wings}
                    errors={errors}
                />

            </form>

        </DashboardLayout>
    );
}
