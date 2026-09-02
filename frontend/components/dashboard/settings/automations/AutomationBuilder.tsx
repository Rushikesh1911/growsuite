// @ts-nocheck
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Edge,
  Node
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArrowLeft, Save, Play, Settings2 } from 'lucide-react';
import { TriggerNode, ActionNode, ConditionNode } from './nodes/CustomNodes';

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
};

interface AutomationBuilderProps {
  token: string;
  workspaceId: number;
  automationId: number | null;
  onBack: () => void;
}

export function AutomationBuilder({ token, workspaceId, automationId, onBack }: AutomationBuilderProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  
  const [name, setName] = useState("New Automation");
  const [triggerType, setTriggerType] = useState("DEAL_STAGE_CHANGED");
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (automationId) {
      loadAutomation();
    } else {
      // Default Trigger Node
      setNodes([
        {
          id: 'trigger-1',
          type: 'trigger',
          position: { x: 250, y: 100 },
          data: { triggerType: 'DEAL_STAGE_CHANGED' },
        }
      ]);
    }
  }, [automationId]);

  const loadAutomation = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/automations/${automationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setName(data.name);
        setTriggerType(data.triggerType);
        if (data.nodes) setNodes(data.nodes);
        if (data.edges) setEdges(data.edges);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveAutomation = async () => {
    setIsSaving(true);
    try {
      const method = automationId ? "PUT" : "POST";
      const url = automationId 
        ? `http://localhost:5000/api/automations/${automationId}`
        : `http://localhost:5000/api/automations`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspaceId.toString(),
        },
        body: JSON.stringify({
          name,
          triggerType,
          nodes,
          edges,
        }),
      });

      if (res.ok) {
        alert("Saved successfully!");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#555', strokeWidth: 2 } }, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowInstance) return;

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: type === 'action' ? { actionType: 'SEND_EMAIL', config: {} } : { field: '', operator: 'equals', value: '' },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes],
  );

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  };

  const updateNodeData = (key: string, value: any) => {
    if (!selectedNode) return;
    
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === selectedNode.id) {
          const newData = { ...n.data, [key]: value };
          setSelectedNode({ ...n, data: newData }); // Update local state for panel
          return { ...n, data: newData };
        }
        return n;
      })
    );

    // If we update actionType, reset config
    if (key === 'actionType') {
      updateNodeData('config', {});
    }
  };

  const updateConfig = (key: string, value: any) => {
    if (!selectedNode) return;
    const newConfig = { ...selectedNode.data.config, [key]: value };
    updateNodeData('config', newConfig);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] -mt-4 animate-fade">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-[#1A1A1A] rounded-md text-[var(--gs-muted)] hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-transparent text-[20px] font-semibold text-white outline-none border-b border-transparent focus:border-[#333] px-1 py-1"
          />
        </div>
        <button
          onClick={saveAutomation}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--gs-fg)] text-[var(--gs-bg)] rounded-md text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Workflow"}
        </button>
      </div>

      <div className="flex flex-1 border border-[#222] rounded-xl overflow-hidden bg-[#0a0a0a]">
        
        {/* Left Sidebar (Components) */}
        <div className="w-[240px] bg-[#111112] border-r border-[#222] flex flex-col">
          <div className="p-4 border-b border-[#222]">
            <h3 className="text-[13px] font-bold text-[#888] uppercase tracking-wider">Components</h3>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <div 
              className="bg-[#1A1A1A] border border-[#333] p-3 rounded-lg cursor-grab hover:border-[#555] transition-colors"
              onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'action')}
              draggable
            >
              <h4 className="text-[13px] font-medium text-white mb-1">Action Node</h4>
              <p className="text-[11px] text-[#666]">Send email, Create project, etc.</p>
            </div>
            
            <div 
              className="bg-[#1A1A1A] border border-[#333] p-3 rounded-lg cursor-grab hover:border-[#555] transition-colors"
              onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'condition')}
              draggable
            >
              <h4 className="text-[13px] font-medium text-white mb-1">Condition (If/Else)</h4>
              <p className="text-[11px] text-[#666]">Branch logic based on data.</p>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              onPaneClick={() => setSelectedNode(null)}
              nodeTypes={nodeTypes}
              fitView
              className="bg-[#050505]"
            >
              <Background color="#222" gap={16} />
              <Controls className="bg-[#1A1A1A] border-[#333] fill-white" />
            </ReactFlow>
          </ReactFlowProvider>
        </div>

        {/* Right Sidebar (Properties Panel) */}
        {selectedNode && (
          <div className="w-[300px] bg-[#111112] border-l border-[#222] flex flex-col overflow-y-auto">
            <div className="p-4 border-b border-[#222] flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-[#888]" />
              <h3 className="text-[13px] font-bold text-[#888] uppercase tracking-wider">Properties</h3>
            </div>
            
            <div className="p-4 flex flex-col gap-5">
              
              {selectedNode.type === 'trigger' && (
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-medium text-[#CCC]">Event Trigger</label>
                  <select 
                    value={selectedNode.data.triggerType}
                    onChange={(e) => {
                      updateNodeData('triggerType', e.target.value);
                      setTriggerType(e.target.value); // Global trigger type
                    }}
                    className="w-full bg-[#1A1A1A] border border-[#333] rounded-md px-3 py-2 text-[13px] text-white outline-none focus:border-[#555]"
                  >
                    <option value="DEAL_STAGE_CHANGED">Deal Stage Changed</option>
                    <option value="LEAD_STATUS_CHANGED">Lead Status Changed</option>
                  </select>
                </div>
              )}

              {selectedNode.type === 'condition' && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-medium text-[#CCC]">Field to check</label>
                    <input 
                      type="text" 
                      placeholder="e.g. deal.stage or lead.status"
                      value={selectedNode.data.field || ''}
                      onChange={(e) => updateNodeData('field', e.target.value)}
                      className="w-full bg-[#1A1A1A] border border-[#333] rounded-md px-3 py-2 text-[13px] text-white outline-none focus:border-[#555]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-medium text-[#CCC]">Operator</label>
                    <select 
                      value={selectedNode.data.operator || 'equals'}
                      onChange={(e) => updateNodeData('operator', e.target.value)}
                      className="w-full bg-[#1A1A1A] border border-[#333] rounded-md px-3 py-2 text-[13px] text-white outline-none focus:border-[#555]"
                    >
                      <option value="equals">Equals (==)</option>
                      <option value="not_equals">Not Equals (!=)</option>
                      <option value="contains">Contains</option>
                      <option value="greater_than">Greater Than (&gt;)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-medium text-[#CCC]">Value</label>
                    <input 
                      type="text" 
                      placeholder="e.g. WON"
                      value={selectedNode.data.value || ''}
                      onChange={(e) => updateNodeData('value', e.target.value)}
                      className="w-full bg-[#1A1A1A] border border-[#333] rounded-md px-3 py-2 text-[13px] text-white outline-none focus:border-[#555]"
                    />
                  </div>
                </>
              )}

              {selectedNode.type === 'action' && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-medium text-[#CCC]">Action Type</label>
                    <select 
                      value={selectedNode.data.actionType || 'SEND_EMAIL'}
                      onChange={(e) => updateNodeData('actionType', e.target.value)}
                      className="w-full bg-[#1A1A1A] border border-[#333] rounded-md px-3 py-2 text-[13px] text-white outline-none focus:border-[#555]"
                    >
                      <option value="SEND_EMAIL">Send Email</option>
                      <option value="CREATE_PROJECT">Create Project</option>
                    </select>
                  </div>

                  {selectedNode.data.actionType === 'SEND_EMAIL' && (
                    <>
                      <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-medium text-[#CCC]">To (Email)</label>
                        <input 
                          type="text" 
                          placeholder="{{deal.contactEmail}}"
                          value={selectedNode.data.config?.to || ''}
                          onChange={(e) => updateConfig('to', e.target.value)}
                          className="w-full bg-[#1A1A1A] border border-[#333] rounded-md px-3 py-2 text-[13px] text-white outline-none focus:border-[#555] font-mono text-[11px]"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-medium text-[#CCC]">Subject</label>
                        <input 
                          type="text" 
                          placeholder="Welcome {{deal.contactName}}!"
                          value={selectedNode.data.config?.subject || ''}
                          onChange={(e) => updateConfig('subject', e.target.value)}
                          className="w-full bg-[#1A1A1A] border border-[#333] rounded-md px-3 py-2 text-[13px] text-white outline-none focus:border-[#555]"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-medium text-[#CCC]">Body</label>
                        <textarea 
                          rows={6}
                          placeholder="Hi {{deal.contactName}}, thanks for choosing {{deal.company}}..."
                          value={selectedNode.data.config?.body || ''}
                          onChange={(e) => updateConfig('body', e.target.value)}
                          className="w-full bg-[#1A1A1A] border border-[#333] rounded-md px-3 py-2 text-[13px] text-white outline-none focus:border-[#555] resize-none"
                        />
                      </div>
                    </>
                  )}

                  {selectedNode.data.actionType === 'CREATE_PROJECT' && (
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-medium text-[#CCC]">Project Name</label>
                      <input 
                        type="text" 
                        placeholder="{{deal.title}} Implementation"
                        value={selectedNode.data.config?.projectName || ''}
                        onChange={(e) => updateConfig('projectName', e.target.value)}
                        className="w-full bg-[#1A1A1A] border border-[#333] rounded-md px-3 py-2 text-[13px] text-white outline-none focus:border-[#555] font-mono text-[11px]"
                      />
                    </div>
                  )}
                  
                  <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
                    <p className="text-[11px] text-blue-400 leading-relaxed">
                      <strong>Tip:</strong> You can use variables in curly braces like <code>{`{{deal.contactName}}`}</code> or <code>{`{{lead.company}}`}</code> to inject dynamic data.
                    </p>
                  </div>
                </>
              )}

            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
