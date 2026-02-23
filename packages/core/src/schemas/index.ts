/**
 * @module @minions-workflows/sdk/schemas
 * Custom MinionType schemas for Minions Workflows.
 */

import type { MinionType } from 'minions-sdk';

export const workflowdefinitionType: MinionType = {
  id: 'workflows-workflow-definition',
  name: 'Workflow definition',
  slug: 'workflow-definition',
  description: 'A reusable multi-step workflow template within a clawspace.',
  icon: '📋',
  schema: [
    { name: 'name', type: 'string', label: 'name' },
    { name: 'description', type: 'string', label: 'description' },
    { name: 'clawspaceId', type: 'string', label: 'clawspaceId' },
    { name: 'version', type: 'string', label: 'version' },
    { name: 'triggerType', type: 'select', label: 'triggerType' },
    { name: 'triggerConfig', type: 'string', label: 'triggerConfig' },
    { name: 'status', type: 'select', label: 'status' },
    { name: 'createdAt', type: 'string', label: 'createdAt' },
    { name: 'updatedAt', type: 'string', label: 'updatedAt' },
  ],
};

export const workflowstepType: MinionType = {
  id: 'workflows-workflow-step',
  name: 'Workflow step',
  slug: 'workflow-step',
  description: 'A single step in a workflow, bound to an agent and skill.',
  icon: '🔹',
  schema: [
    { name: 'workflowId', type: 'string', label: 'workflowId' },
    { name: 'name', type: 'string', label: 'name' },
    { name: 'stepIndex', type: 'number', label: 'stepIndex' },
    { name: 'agentId', type: 'string', label: 'agentId' },
    { name: 'skillRef', type: 'string', label: 'skillRef' },
    { name: 'inputMapping', type: 'string', label: 'inputMapping' },
    { name: 'outputMapping', type: 'string', label: 'outputMapping' },
    { name: 'onSuccess', type: 'string', label: 'onSuccess' },
    { name: 'onFailure', type: 'string', label: 'onFailure' },
    { name: 'timeoutMs', type: 'number', label: 'timeoutMs' },
  ],
};

export const workflowrunType: MinionType = {
  id: 'workflows-workflow-run',
  name: 'Workflow run',
  slug: 'workflow-run',
  description: 'An execution instance of a workflow definition.',
  icon: '▶️',
  schema: [
    { name: 'workflowId', type: 'string', label: 'workflowId' },
    { name: 'status', type: 'select', label: 'status' },
    { name: 'currentStepIndex', type: 'number', label: 'currentStepIndex' },
    { name: 'startedAt', type: 'string', label: 'startedAt' },
    { name: 'completedAt', type: 'string', label: 'completedAt' },
    { name: 'triggeredBy', type: 'string', label: 'triggeredBy' },
    { name: 'inputs', type: 'string', label: 'inputs' },
    { name: 'outputs', type: 'string', label: 'outputs' },
    { name: 'errorMessage', type: 'string', label: 'errorMessage' },
  ],
};

export const workflowtransitionType: MinionType = {
  id: 'workflows-workflow-transition',
  name: 'Workflow transition',
  slug: 'workflow-transition',
  description: 'A logged transition between steps during a workflow run.',
  icon: '➡️',
  schema: [
    { name: 'runId', type: 'string', label: 'runId' },
    { name: 'fromStep', type: 'string', label: 'fromStep' },
    { name: 'toStep', type: 'string', label: 'toStep' },
    { name: 'triggeredAt', type: 'string', label: 'triggeredAt' },
    { name: 'reason', type: 'string', label: 'reason' },
    { name: 'durationMs', type: 'number', label: 'durationMs' },
  ],
};

export const customTypes: MinionType[] = [
  workflowdefinitionType,
  workflowstepType,
  workflowrunType,
  workflowtransitionType,
];

