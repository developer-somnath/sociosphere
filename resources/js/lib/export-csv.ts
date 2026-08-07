/**
 * Shared client-side CSV exporter (blueprint §8 — export).
 *
 * Generates a UTF-8 (BOM-prefixed) CSV from the given rows and triggers a
 * browser download. Use with the `ExportMenu` component for the "CSV" format
 * on any listing page.
 */
type CsvColumn<T> = {
    header: string;
    accessor: (row: T) => string | number | null | undefined;
};

export function exportCsv<T>({
    filename,
    columns,
    rows,
}: {
    filename: string;
    columns: CsvColumn<T>[];
    rows: T[];
}) {
    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const header = columns.map((column) => escape(column.header));
    const body = rows.map((row) =>
        columns.map((column) => escape(String(column.accessor(row) ?? ""))),
    );

    const csv = [header, ...body].map((line) => line.join(",")).join("\n");
    // Prepend BOM so Excel opens UTF-8 CSV correctly.
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}
