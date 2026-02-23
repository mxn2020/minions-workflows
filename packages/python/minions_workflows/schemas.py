"""
Minions Workflows SDK — Type Schemas
Custom MinionType schemas for Minions Workflows.
"""

from minions.types import FieldDefinition, FieldValidation, MinionType

workflow_definition_type = MinionType(
    id="workflows-workflow-definition",
    name="Workflow definition",
    slug="workflow-definition",
    description="A reusable multi-step workflow template within a clawspace.",
    icon="📋",
    schema=[
        FieldDefinition(name="name", type="string", label="name"),
        FieldDefinition(name="description", type="string", label="description"),
        FieldDefinition(name="clawspaceId", type="string", label="clawspaceId"),
        FieldDefinition(name="version", type="string", label="version"),
        FieldDefinition(name="triggerType", type="select", label="triggerType"),
        FieldDefinition(name="triggerConfig", type="string", label="triggerConfig"),
        FieldDefinition(name="status", type="select", label="status"),
        FieldDefinition(name="createdAt", type="string", label="createdAt"),
        FieldDefinition(name="updatedAt", type="string", label="updatedAt"),
    ],
)

workflow_step_type = MinionType(
    id="workflows-workflow-step",
    name="Workflow step",
    slug="workflow-step",
    description="A single step in a workflow, bound to an agent and skill.",
    icon="🔹",
    schema=[
        FieldDefinition(name="workflowId", type="string", label="workflowId"),
        FieldDefinition(name="name", type="string", label="name"),
        FieldDefinition(name="stepIndex", type="number", label="stepIndex"),
        FieldDefinition(name="agentId", type="string", label="agentId"),
        FieldDefinition(name="skillRef", type="string", label="skillRef"),
        FieldDefinition(name="inputMapping", type="string", label="inputMapping"),
        FieldDefinition(name="outputMapping", type="string", label="outputMapping"),
        FieldDefinition(name="onSuccess", type="string", label="onSuccess"),
        FieldDefinition(name="onFailure", type="string", label="onFailure"),
        FieldDefinition(name="timeoutMs", type="number", label="timeoutMs"),
    ],
)

workflow_run_type = MinionType(
    id="workflows-workflow-run",
    name="Workflow run",
    slug="workflow-run",
    description="An execution instance of a workflow definition.",
    icon="▶️",
    schema=[
        FieldDefinition(name="workflowId", type="string", label="workflowId"),
        FieldDefinition(name="status", type="select", label="status"),
        FieldDefinition(name="currentStepIndex", type="number", label="currentStepIndex"),
        FieldDefinition(name="startedAt", type="string", label="startedAt"),
        FieldDefinition(name="completedAt", type="string", label="completedAt"),
        FieldDefinition(name="triggeredBy", type="string", label="triggeredBy"),
        FieldDefinition(name="inputs", type="string", label="inputs"),
        FieldDefinition(name="outputs", type="string", label="outputs"),
        FieldDefinition(name="errorMessage", type="string", label="errorMessage"),
    ],
)

workflow_transition_type = MinionType(
    id="workflows-workflow-transition",
    name="Workflow transition",
    slug="workflow-transition",
    description="A logged transition between steps during a workflow run.",
    icon="➡️",
    schema=[
        FieldDefinition(name="runId", type="string", label="runId"),
        FieldDefinition(name="fromStep", type="string", label="fromStep"),
        FieldDefinition(name="toStep", type="string", label="toStep"),
        FieldDefinition(name="triggeredAt", type="string", label="triggeredAt"),
        FieldDefinition(name="reason", type="string", label="reason"),
        FieldDefinition(name="durationMs", type="number", label="durationMs"),
    ],
)

custom_types: list[MinionType] = [
    workflow_definition_type,
    workflow_step_type,
    workflow_run_type,
    workflow_transition_type,
]

