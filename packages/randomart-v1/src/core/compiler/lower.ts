/**
 * DAG lowering pass. Multiplicities owned by `Operator` (probed at catalog construction). Lowers
 * three-channel expression into shared DAG with interned coordinate contexts.
 *
 * Vocabulary: node = expression tree element; vertex = DAG entry (context, operator, params, input
 * ids); value = number in [-1, 1]. Coordinate-independent terminals duplicated per context; driver
 * folds constants.
 */

import type { Catalog } from '../catalog/types';
import type { Expression, Node } from '../expression/types';
import { ROOT_CTX } from './constants';
import type { ContextDef, LowerResult, ProgramItem, Vertex } from './types';

export function lower(catalog: Catalog, expression: Expression): LowerResult {
    const vertices: Vertex[] = [];
    const contexts: ContextDef[] = [];
    const program: ProgramItem[] = [];
    const usages: number[] = [];
    const vertexMap = new Map<string, number>(); // key → vertex id
    const contextMap = new Map<string, string>(); // key → context name

    let nextVertexId = 0;
    let nextContextId = 1;

    function lowerNode(node: Node, contextName: string): number {
        const { operatorName, params, inputs } = node;
        const operator = catalog.operator(operatorName);
        const paramsStr = params.join(',');

        const currentIds = inputs
            .slice(0, operator.currentCount)
            .map((child) => lowerNode(child, contextName));

        let innerContext = contextName;

        if (operator.hasInner) {
            const contextKey = `${contextName}|${operatorName}[${paramsStr}](${currentIds.join(',')})`;
            const known = contextMap.get(contextKey);

            if (known === undefined) {
                const id = nextContextId++;

                innerContext = `c${id}`;
                contextMap.set(contextKey, innerContext);

                // Coordinates multiplicity: counted once per context created, not per reference.
                currentIds.forEach((inputId, j) => {
                    usages[inputId] = (usages[inputId] ?? 0) + operator.coordsMultiplicity(j);
                });

                const contextDef: ContextDef = {
                    id,
                    name: innerContext,
                    parentName: contextName,
                    operatorName,
                    params,
                    currentInputIds: Object.freeze([...currentIds]),
                    requires: [...operator.requires],
                };

                contexts.push(contextDef);
                program.push({ kind: 'context', context: contextDef });
            } else {
                innerContext = known;
            }
        }

        const innerIds = inputs
            .slice(operator.currentCount)
            .map((child) => lowerNode(child, innerContext));
        const allInputIds = [...currentIds, ...innerIds];

        const vertexKey = `${contextName}|${operatorName}[${paramsStr}](${allInputIds.join(',')})`;
        const existing = vertexMap.get(vertexKey);

        if (existing !== undefined) {
            return existing;
        }

        const id = nextVertexId++;

        allInputIds.forEach((inputId, i) => {
            usages[inputId] = (usages[inputId] ?? 0) + operator.multiplicity(i);
        });

        const vertex: Vertex = {
            id,
            operatorName,
            params,
            inputIds: Object.freeze(allInputIds),
            context: contextName,
            requires: [...operator.requires],
        };

        vertices.push(vertex);
        usages[id] ??= 0;
        vertexMap.set(vertexKey, id);
        program.push({ kind: 'vertex', vertex });

        return id;
    }

    const roots = [expression.r, expression.g, expression.b].map((root) =>
        lowerNode(root, ROOT_CTX),
    ) as [number, number, number];

    for (const rootId of roots) {
        usages[rootId] = (usages[rootId] ?? 0) + 1;
    }

    return {
        vertices: Object.freeze(vertices),
        contexts: Object.freeze(contexts),
        program: Object.freeze(program),
        usages: Object.freeze(usages),
        roots,
    };
}
