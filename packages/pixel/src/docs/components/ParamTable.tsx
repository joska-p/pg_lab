import type { ParamDef } from './data/pipeline-docs-data';

interface ParamTableProps {
    params: ParamDef[];
}

function ParamTable({ params }: ParamTableProps) {
    return (
        <div className="border-border overflow-hidden rounded-lg border">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="bg-muted/50 text-muted-foreground border-border border-b text-xs font-semibold uppercase">
                        <th className="px-4 py-2.5">Name</th>
                        <th className="px-4 py-2.5">Type</th>
                        <th className="px-4 py-2.5">Default</th>
                        <th className="px-4 py-2.5">Description</th>
                    </tr>
                </thead>
                <tbody>
                    {params.map((parameter) => (
                        <tr key={parameter.key} className="border-border border-b last:border-b-0">
                            <td className="text-primary px-4 py-2.5 text-xs font-medium">
                                {parameter.key}
                            </td>
                            <td className="text-foreground/80 px-4 py-2.5 text-xs">number</td>
                            <td className="text-foreground/80 px-4 py-2.5 text-xs">
                                {parameter.default}
                            </td>
                            <td className="text-muted-foreground px-4 py-2.5 text-xs">
                                {parameter.label}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export { ParamTable };
