import OpenAI from 'openai';

export interface AIService {
  summarize(text: string): Promise<string>;
  bulletPoints(text: string): Promise<string>;
  tidy(text: string): Promise<string>;
}

class OpenRouterService implements AIService {
  private client: OpenAI | null = null;
  private store: any = null;
  private isTauri: boolean;

  constructor() {
    this.isTauri = typeof window !== 'undefined' && '__TAURI__' in window;
    this.initStore();
  }

  private async initStore() {
    if (this.isTauri) {
      try {
        const { Store } = await import('@tauri-apps/plugin-store');
        this.store = await Store.load('settings.json');
      } catch (error) {
        console.error('Failed to initialize Tauri store:', error);
        this.isTauri = false;
      }
    }
  }

  private async getClient(): Promise<OpenAI> {
    if (!this.client) {
      const apiKey = await this.getApiKey();
      const baseURL = await this.getBaseURL();
      
      if (!apiKey) {
        throw new Error('OpenRouter API key not configured. Please set your API key in settings.');
      }

      this.client = new OpenAI({
        baseURL: baseURL,
        apiKey: apiKey,
        defaultHeaders: {
          'HTTP-Referer': 'ai-scratchpad',
          'X-Title': 'AI Scratchpad',
        },
        dangerouslyAllowBrowser: true,
      });
    }

    return this.client;
  }

  async setApiKey(apiKey: string): Promise<void> {
    if (this.isTauri && this.store) {
      await this.store.set('openrouter_api_key', apiKey);
      await this.store.save();
    } else {
      // Browser mode - use localStorage
      localStorage.setItem('openrouter_api_key', apiKey);
    }
    this.client = null; // Reset client to use new key
  }

  async getApiKey(): Promise<string | null> {
    if (this.isTauri && this.store) {
      return await this.store.get('openrouter_api_key') || null;
    } else {
      // Browser mode - use localStorage
      return localStorage.getItem('openrouter_api_key');
    }
  }

  async setBaseURL(baseURL: string): Promise<void> {
    if (this.isTauri && this.store) {
      await this.store.set('openrouter_base_url', baseURL);
      await this.store.save();
    } else {
      // Browser mode - use localStorage
      localStorage.setItem('openrouter_base_url', baseURL);
    }
    this.client = null; // Reset client to use new base URL
  }

  async getBaseURL(): Promise<string> {
    const defaultURL = 'https://openrouter.ai/api/v1';
    
    if (this.isTauri && this.store) {
      const storedURL = await this.store.get('openrouter_base_url');
      return (storedURL as string) || defaultURL;
    } else {
      // Browser mode - use localStorage
      return localStorage.getItem('openrouter_base_url') || defaultURL;
    }
  }

  async summarize(text: string): Promise<string> {
    const client = await this.getClient();
    
    try {
      const response = await client.chat.completions.create({
        model: 'openai/gpt-4.1-nano',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates concise summaries. Provide a clear, well-structured summary of the given text.'
          },
          {
            role: 'user',
            content: `Please summarize the following text:\n\n${text}`
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
      });

      return response.choices[0]?.message?.content || 'Failed to generate summary';
    } catch (error) {
      console.error('OpenRouter API error:', error);
      throw new Error(`Failed to summarize text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async bulletPoints(text: string): Promise<string> {
    const client = await this.getClient();
    
    try {
      const response = await client.chat.completions.create({
        model: 'openai/gpt-4.1-nano',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that converts text into well-organized bullet points. Create clear, concise bullet points that capture the key information from the given text. Format your response as an HTML unordered list using <ul> and <li> tags without any additional text or explanations.'
          },
          {
            role: 'user',
            content: `Please convert the following text into bullet points:\n\n${text}`
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
      });

      return response.choices[0]?.message?.content || 'Failed to generate bullet points';
    } catch (error) {
      console.error('OpenRouter API error:', error);
      throw new Error(`Failed to create bullet points: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async tidy(text: string): Promise<string> {
    const client = await this.getClient();
    
    try {
      const response = await client.chat.completions.create({
        model: 'openai/gpt-4.1-nano',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that improves text by fixing formatting, spelling, grammar, and readability. Fix any errors while preserving the original meaning and tone. Return only the corrected text without any explanatory notes or surrounding text.'
          },
          {
            role: 'user',
            content: `Please fix the formatting, spelling, grammar, and readability of the following text:\n\n${text}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.1,
      });

      return response.choices[0]?.message?.content || 'Failed to tidy text';
    } catch (error) {
      console.error('OpenRouter API error:', error);
      throw new Error(`Failed to tidy text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const openRouterService = new OpenRouterService();