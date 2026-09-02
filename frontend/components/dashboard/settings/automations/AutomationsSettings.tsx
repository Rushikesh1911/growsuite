import { useState } from "react";
import { AutomationList } from "./AutomationList";
import { AutomationBuilder } from "./AutomationBuilder";

interface AutomationsSettingsProps {
  token: string;
  workspaceId: number;
}

export function AutomationsSettings({ token, workspaceId }: AutomationsSettingsProps) {
  const [activeAutomationId, setActiveAutomationId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  if (activeAutomationId || isCreating) {
    return (
      <AutomationBuilder 
        token={token} 
        workspaceId={workspaceId}
        automationId={activeAutomationId}
        onBack={() => {
          setActiveAutomationId(null);
          setIsCreating(false);
        }}
      />
    );
  }

  return (
    <AutomationList 
      token={token} 
      workspaceId={workspaceId} 
      onSelect={(id) => setActiveAutomationId(id)}
      onCreate={() => setIsCreating(true)}
    />
  );
}
