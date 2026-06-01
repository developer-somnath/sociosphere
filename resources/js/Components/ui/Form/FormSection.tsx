import Card from "@/Components/ui/Card/Card";

interface FormSectionProps {
    title: string;
    description?: string;
    children: React.ReactNode;
}

export default function FormSection({
    title,
    description,
    children,
}: FormSectionProps) {
    return (
        <Card className="p-6">

            <div className="mb-6">

                <h3
                    className="
                        text-lg
                        font-semibold
                        text-slate-900
                    "
                >
                    {title}
                </h3>

                {description && (

                    <p
                        className="
                            mt-1
                            text-sm
                            text-slate-500
                        "
                    >
                        {description}
                    </p>

                )}

            </div>

            {children}

        </Card>
    );
}
