declare global {
  interface Window {
    ai: AI;
  }

  interface AI {
    readonly languageModel: AILanguageModelFactory;
    readonly summarizer: AISummarizerFactory;
  }

  interface AILanguageModelFactory {
    create(options?: AILanguageModelCreateOptions): Promise<AILanguageModel>;
    capabilities(): Promise<AILanguageModelCapabilities>;
  }

  interface AILanguageModel {
    prompt(input: string, options?: AILanguageModelPromptOptions): Promise<string>;
    promptStreaming(input: string, options?: AILanguageModelPromptOptions): ReadableStream<string>;
    countPromptTokens(input: string, options?: AILanguageModelPromptOptions): Promise<number>;

    readonly maxTokens: number;
    readonly tokensSoFar: number;
    readonly tokensLeft: number;
    readonly topK: number;
    readonly temperature: number;

    clone(): Promise<AILanguageModel>;
    destroy(): void;
  }

  interface AILanguageModelCapabilities {
    readonly available: "readily" | "after-download" | "no";
    readonly defaultTopK: number | null;
    readonly maxTopK: number | null;
    readonly defaultTemperature: number | null;
  }

  interface AILanguageModelCreateOptions {
    signal?: AbortSignal;
    monitor?: (monitor: AICreateMonitor) => void;
    systemPrompt?: string;
    initialPrompts?: AILanguageModelPrompt[];
    topK?: number;
    temperature?: number;
  }

  interface AILanguageModelPromptOptions {
    signal?: AbortSignal;
  }

  interface AILanguageModelPrompt {
    role: "system" | "user" | "assistant";
    content: string;
  }

  interface AICreateMonitor extends EventTarget {
    ondownloadprogress: (event: Event) => void;
  }

  interface AISummarizerFactory {
    create(options?: AISummarizerCreateOptions): Promise<AISummarizer>;
    capabilities(): Promise<AISummarizerCapabilities>;
  }

  interface AISummarizerModel extends EventTarget {
    summarize(text: string, options?: AISummarizerOptions): Promise<string>;
    ready: Promise<void>;
    destroy(): void;
  }

  interface AISummarizerCapabilities {
    readonly available: "readily" | "after-download" | "no";
  }

  interface AISummarizerCreateOptions {
    signal?: AbortSignal;
  }

  interface AISummarizerOptions {
    signal?: AbortSignal;
  }
}

export {};