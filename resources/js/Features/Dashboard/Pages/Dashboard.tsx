import DashboardLayout from "@/Layouts/DashboardLayout";

import FormSection from "@/Components/ui/Form/FormSection";
import TextInput from "@/Components/ui/Form/TextInput";
import Select from "@/Components/ui/Form/Select";
import Textarea from "@/Components/ui/Form/Textarea";

export default function FormPreview() {
    return (
        <DashboardLayout>

            <div className="max-w-4xl mx-auto space-y-6">

                <FormSection
                    title="Flat Information"
                    description="Basic details of the flat"
                >

                    <div className="grid grid-cols-2 gap-6">

                        <TextInput
                            label="Flat Number"
                            placeholder="A-101"
                        />

                        <TextInput
                            label="Area (sqft)"
                            placeholder="1200"
                        />

                        <Select
                            label="Tower"
                            value=""
                            onChange={() => {}}
                            options={[
                                {
                                    value: "A",
                                    label: "Tower A",
                                },
                                {
                                    value: "B",
                                    label: "Tower B",
                                },
                            ]}
                        />

                    </div>

                </FormSection>

                <FormSection
                    title="Additional Notes"
                >

                    <Textarea
                        label="Notes"
                        rows={4}
                    />

                </FormSection>

            </div>

        </DashboardLayout>
    );
}
