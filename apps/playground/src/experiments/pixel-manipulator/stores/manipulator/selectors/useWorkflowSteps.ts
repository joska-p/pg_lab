import { manipulatorStore } from '../store';
import type { WorkflowStep } from '../types';

function useWorkflowSteps(): WorkflowStep[] {
    return manipulatorStore((s) => s.workflow);
}

export { useWorkflowSteps };
