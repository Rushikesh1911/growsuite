import { Handle, Position } from '@xyflow/react';
import { Zap, Mail, FolderPlus, GitBranch } from 'lucide-react';

// Custom Trigger Node
export function TriggerNode({ data }: any) {
  return (
    <div className="bg-[#1A1A1A] border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)] rounded-xl min-w-[240px] overflow-hidden">
      <div className="bg-amber-500/10 px-4 py-2 border-b border-amber-500/20 flex items-center gap-2">
        <Zap className="h-4 w-4 text-amber-500" />
        <span className="text-[12px] font-bold text-amber-500 uppercase tracking-wider">Trigger</span>
      </div>
      <div className="p-4">
        <h3 className="text-[14px] font-medium text-white mb-1">
          {data.triggerType === 'DEAL_STAGE_CHANGED' ? 'Deal Stage Changed' : 
           data.triggerType === 'LEAD_STATUS_CHANGED' ? 'Lead Status Changed' : 'Select Trigger'}
        </h3>
        <p className="text-[12px] text-[#888]">When this event happens...</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-amber-500 border-2 border-[#1A1A1A]" />
    </div>
  );
}

// Custom Action Node
export function ActionNode({ data }: any) {
  const isEmail = data.actionType === 'SEND_EMAIL';
  const isProject = data.actionType === 'CREATE_PROJECT';
  
  return (
    <div className="bg-[#1A1A1A] border border-[#333] shadow-lg rounded-xl min-w-[240px] overflow-hidden">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-[#666] border-2 border-[#1A1A1A]" />
      
      <div className="bg-[#222] px-4 py-2 border-b border-[#333] flex items-center gap-2">
        {isEmail ? <Mail className="h-4 w-4 text-blue-400" /> : 
         isProject ? <FolderPlus className="h-4 w-4 text-emerald-400" /> : 
         <Zap className="h-4 w-4 text-[#888]" />}
        <span className="text-[12px] font-bold text-[#CCC] uppercase tracking-wider">Action</span>
      </div>
      <div className="p-4">
        <h3 className="text-[14px] font-medium text-white mb-1">
          {isEmail ? 'Send Email' : 
           isProject ? 'Create Project' : 'Configure Action'}
        </h3>
        <p className="text-[12px] text-[#888] truncate max-w-[200px]">
          {isEmail ? `To: ${data.config?.to || 'Not set'}` : 
           isProject ? `Name: ${data.config?.projectName || 'Not set'}` : '...'}
        </p>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-[#666] border-2 border-[#1A1A1A]" />
    </div>
  );
}

// Custom Condition Node
export function ConditionNode({ data }: any) {
  return (
    <div className="bg-[#1A1A1A] border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)] rounded-xl min-w-[240px] overflow-hidden relative">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-indigo-500 border-2 border-[#1A1A1A]" />
      
      <div className="bg-indigo-500/10 px-4 py-2 border-b border-indigo-500/20 flex items-center gap-2">
        <GitBranch className="h-4 w-4 text-indigo-400" />
        <span className="text-[12px] font-bold text-indigo-400 uppercase tracking-wider">Condition</span>
      </div>
      <div className="p-4">
        <h3 className="text-[14px] font-medium text-white mb-1">If / Else</h3>
        <p className="text-[12px] text-[#888]">
          {data.field ? `${data.field} ${data.operator} ${data.value}` : 'Set condition'}
        </p>
      </div>
      
      {/* True Handle */}
      <div className="absolute bottom-0 left-1/4 -translate-x-1/2 translate-y-1/2 flex flex-col items-center">
        <span className="text-[10px] text-green-400 font-bold mb-0.5 absolute -top-4">TRUE</span>
        <Handle 
          type="source" 
          position={Position.Bottom} 
          id="true" 
          className="w-3 h-3 bg-green-500 border-2 border-[#1A1A1A] !relative !transform-none !left-0 !top-0" 
        />
      </div>

      {/* False Handle */}
      <div className="absolute bottom-0 left-3/4 -translate-x-1/2 translate-y-1/2 flex flex-col items-center">
        <span className="text-[10px] text-red-400 font-bold mb-0.5 absolute -top-4">FALSE</span>
        <Handle 
          type="source" 
          position={Position.Bottom} 
          id="false" 
          className="w-3 h-3 bg-red-500 border-2 border-[#1A1A1A] !relative !transform-none !left-0 !top-0" 
        />
      </div>
    </div>
  );
}
