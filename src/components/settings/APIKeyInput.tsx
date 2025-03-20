
import React, { useState } from 'react';
import { Key } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomButton } from '@/components/ui/custom-button';
import { saveOpenAIKey, isOpenAIConfigured, OpenAIConfig } from '@/config/openai';
import { toast } from 'sonner';

interface APIKeyInputProps {
  onKeySaved?: () => void;
}

const APIKeyInput: React.FC<APIKeyInputProps> = ({ onKeySaved }) => {
  const [apiKey, setApiKey] = useState<string>(OpenAIConfig.apiKey || '');
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      toast.error('Please enter a valid API key');
      return;
    }

    saveOpenAIKey(apiKey);
    toast.success('API key saved successfully');
    if (onKeySaved) onKeySaved();
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center space-x-2">
        <Key size={16} />
        <h3 className="text-base font-medium">OpenAI API Key</h3>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="openai-key">
          Enter your OpenAI API key
        </Label>
        <div className="flex gap-2">
          <Input
            id="openai-key"
            type={isVisible ? "text" : "password"}
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <CustomButton 
            variant="secondary"
            type="button"
            onClick={() => setIsVisible(!isVisible)}
            className="w-24"
          >
            {isVisible ? "Hide" : "Show"}
          </CustomButton>
        </div>
        <p className="text-xs text-muted-foreground">
          You can get your API key from the <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">OpenAI dashboard</a>
        </p>
      </div>

      <CustomButton onClick={handleSaveKey} className="w-full">
        Save API Key
      </CustomButton>
    </div>
  );
};

export default APIKeyInput;
