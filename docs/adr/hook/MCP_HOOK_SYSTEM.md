# ADR-001: MCP Workflow System Architecture

## Status

Accepted

## Context

MCP Router is a system that integrates multiple MCP (Model Context Protocol) servers and functions as a single endpoint. Users requested the ability to insert custom logic into the MCP request/response processing flow.

Main requirements:
- Execute custom logic both before request sending (Pre-hook) and after response receiving (Post-hook)
- Filter, modify, or block requests based on conditions
- Allow users to write logic in JavaScript
- Provide a secure execution environment
- Visual execution flow definition

## Decision

### 1. Architecture Pattern

**Workflow-Centric Modular Architecture**

Hooks are implemented not as an independent system, but as modules (nodes) within the Workflow system. This enables visualization of execution flow and flexible control.

```
UI Layer (React)
    ├── WorkflowEditor (React Flow)
    │   ├── StartNode
    │   ├── EndNode
    │   ├── MCPCallNode
    │   └── HookNode (Module)
    ↓
Workflow Engine
    ├── Workflow Definition
    ├── Node Execution
    └── Hook Script Execution
```

### 2. Workflow System

**Visual Programming Paradigm**

Using React Flow-based visual editor, users define processing flows by drag-and-drop node placement.

```typescript
interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  workflowType: "tools/list" | "tools/call";
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
}
```

### 3. Node Types

#### 3.1 Basic Nodes

```typescript
interface WorkflowNode {
  id: string;
  type: "start" | "end" | "mcp-call" | "hook";
  position: { x: number; y: number };
  data: {
    label: string;
    hook?: WorkflowHook;  // when type === 'hook'
    [key: string]: any;
  };
  deletable?: boolean;
}
```

#### 3.2 Hook Node (Module)

Hooks are modules that are part of workflows with the following characteristics:

```typescript
interface WorkflowHook {
  id: string;
  script: string;      // JavaScript code
  blocking: boolean;   // true: synchronous execution, false: asynchronous (Fire & Forget)
}
```

**Node Input/Output Constraints:**
- **Start Node**: No input, multiple outputs allowed
- **End Node**: Single input only, no output
- **MCP Call Node**: Single input, multiple outputs allowed
- **Sync Hook** (blocking=true): Single input, multiple outputs allowed
- **Fire-and-forget Hook** (blocking=false): Single input, no output

### 4. Hook Execution Environment

**Sandbox Execution within Workflow Engine**

Hook scripts are managed by the Workflow Engine and executed in the following environment:

```javascript
// Hook Context
{
  request: {
    method: string,    // MCP method name
    params: any        // Request parameters
  },
  response?: any,      // Response for Post-hook
  metadata: {
    clientId: string,
    serverName?: string,
    workflowId: string,
    nodeId: string
  }
}
```

### 5. Execution Flow

#### 5.1 Workflow Execution Order

```
Start → [Pre-hooks] → MCP Call → [Post-hooks] → End
         ↓                          ↓
    [Fire & Forget]            [Fire & Forget]
```

#### 5.2 Execution Order Determination Algorithm

1. **Main Path Identification**
   - Execute sequentially from Start node
   - Wait for synchronous nodes to complete
   - Proceed immediately for asynchronous nodes

2. **Branch Processing**
   - Fire-and-forget nodes execute in parallel
   - Main flow continues even if errors occur

```typescript
async function executeWorkflow(workflow: WorkflowDefinition, context: Context) {
  const startNode = workflow.nodes.find(n => n.type === 'start');
  let currentNode = startNode;

  while (currentNode && currentNode.type !== 'end') {
    // Node execution
    if (currentNode.type === 'hook') {
      if (currentNode.data.hook?.blocking) {
        await executeHookSync(currentNode.data.hook, context);
      } else {
        executeHookAsync(currentNode.data.hook, context); // Don't wait
      }
    } else if (currentNode.type === 'mcp-call') {
      await executeMCPCall(context);
    }

    // Move to next node
    const outgoingEdge = workflow.edges.find(e => e.source === currentNode.id);
    currentNode = workflow.nodes.find(n => n.id === outgoingEdge?.target);
  }
}
```

### 6. Visual Editor Features

**React Flow-based Editor**

- Drag & drop node placement
- Visual definition of connections between nodes
- Real-time validation
- Inline Hook script editing

## Consequences

### Positive

1. **Improved Visibility**
   - Execution flow is understandable at a glance
   - Easy debugging
   - Non-programmers can understand basic flows

2. **Modular Design**
   - Hooks are reusable modules
   - Easy to add new node types
   - Clear separation of responsibilities

3. **Flexibility**
   - Complex flows can be built visually
   - Mixed synchronous/asynchronous execution possible
   - Easy to add conditional branching in the future

4. **Maintainability**
   - Workflows are saved as JSON
   - Easy version control
   - Export/import capability

### Negative

1. **Increased Complexity**
   - UI implementation is complex
   - User learning curve

2. **Performance**
   - Visual editor overhead
   - Rendering cost for large-scale workflows

3. **Constraints**
   - Currently no conditional branching (planned for future)
   - No loop structures (intentional limitation)

## Migration Path

### Phase 1: Current Implementation
- Basic Workflow editor
- Hook, Start, End, MCP Call nodes
- Linear flow support

### Phase 2: Future Extensions
- Conditional branching nodes
- Variable/state management nodes
- Plugin system for custom node types
- Workflow templates/marketplace

## Implementation Notes

1. **Error Handling**:
   - Synchronous Hook errors stop the flow
   - Asynchronous Hook errors are logged only

2. **Persistence**:
   - Workflows are saved as JSON in local storage
   - Migration to database planned for the future

3. **Execution Monitoring**:
   - Visualize execution state of each node
   - Measure execution time and identify bottlenecks

## References

- [React Flow Documentation](https://reactflow.dev/)
- [MCP Protocol Specification](https://modelcontextprotocol.io/docs)
- [Visual Programming Languages](https://en.wikipedia.org/wiki/Visual_programming_language)
