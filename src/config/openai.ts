
// OpenAI API configuration
export const OpenAIConfig = {
  apiKey: process.env.OPENAI_API_KEY || localStorage.getItem('openai_api_key') || '',
  model: 'gpt-4-turbo',
  maxTokens: 1500,
  temperature: 0.7,
};

export const isOpenAIConfigured = (): boolean => {
  return !!OpenAIConfig.apiKey;
};

export const saveOpenAIKey = (apiKey: string): void => {
  localStorage.setItem('openai_api_key', apiKey);
  // Reload the configuration
  OpenAIConfig.apiKey = apiKey;
};
