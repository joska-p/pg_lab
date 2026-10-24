import { getManipulations, processImageInWorker } from '@repo/pixel/worker';

import { manipulatorStore } from './store';
import type { OutputType, WorkflowStep } from './types';

function setImageSource(imageSource: OutputType) {
    manipulatorStore.setState({ imageSource });
}

function clearImageSource() {
    const imageSource = null;

    manipulatorStore.setState({ imageSource });
}

function setOutputs(outputs: OutputType[]) {
    manipulatorStore.setState({ outputs });
}

function clearOutputs() {
    manipulatorStore.setState({ outputs: [] });
}

function addWorkflowStep(id: string) {
    const { workflow } = manipulatorStore.getState();
    const entry = getManipulations()[id];

    manipulatorStore.setState({
        workflow: [
            ...workflow,
            {
                uid: crypto.randomUUID(),
                id,
                options: { ...entry.defaultArgs },
            },
        ],
    });
}

function removeWorkflowStep(index: number) {
    const { workflow } = manipulatorStore.getState();

    manipulatorStore.setState({
        workflow: workflow.filter((_, i) => i !== index),
    });
}

function moveWorkflowStep(index: number, direction: -1 | 1) {
    const { workflow } = manipulatorStore.getState();
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= workflow.length) {
        return;
    }

    const updated = [...workflow];
    const current = updated[index];
    const target = updated[targetIndex];

    updated[index] = target;
    updated[targetIndex] = current;
    manipulatorStore.setState({ workflow: updated });
}

function updateStepOptions(index: number, options: Record<string, number>) {
    const { workflow } = manipulatorStore.getState();
    const updated = workflow.map((step, i) => (i === index ? { ...step, options } : step));

    manipulatorStore.setState({ workflow: updated });
}

function clearWorkflowSteps() {
    manipulatorStore.setState({ workflow: [] });
}

function setWorkflowSteps(steps: WorkflowStep[]) {
    manipulatorStore.setState({ workflow: [...steps] });
}

async function executeWorkflow() {
    const { imageSource, workflow } = manipulatorStore.getState();

    if (!workflow.length || !imageSource?.imageData) {
        return;
    }

    manipulatorStore.setState({ isProcessing: true });

    try {
        const results = await processImageInWorker({
            sourceImageData: imageSource.imageData,
            steps: workflow.map((step) => ({ id: step.id, options: step.options })),
        });

        const outputs = [];

        for (const result of results) {
            outputs.push({
                id: `step-${String(outputs.length + 1)}`,
                name: `Step ${String(outputs.length + 1)}`,
                description: `Step ${String(outputs.length + 1)}`,
                imageData: result,
            });
        }

        setOutputs(outputs);
    } catch (err) {
        console.error('Pipeline execution failed:', err);
    } finally {
        manipulatorStore.setState({ isProcessing: false });
    }
}

export {
    addWorkflowStep,
    clearImageSource,
    clearOutputs,
    clearWorkflowSteps,
    executeWorkflow,
    moveWorkflowStep,
    removeWorkflowStep,
    setImageSource,
    setWorkflowSteps,
    updateStepOptions,
};
