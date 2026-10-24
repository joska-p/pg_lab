interface OutputType {
    id: string;
    name: string;
    description: string;
    imageData: ImageData;
}

interface WorkflowStep {
    uid: string;
    id: string;
    options: Record<string, unknown>;
}

export type { OutputType, WorkflowStep };
