// Chrome Extension API type declarations
declare namespace chrome {
  namespace tabs {
    interface Tab {
      id?: number;
      url?: string;
      title?: string;
    }
    
    function query(queryInfo: { active?: boolean; currentWindow?: boolean }): Promise<Tab[]>;
  }

  namespace runtime {
    function sendMessage(message: any): Promise<any>;
    const onMessage: {
      addListener(callback: (request: any, sender: any, sendResponse: any) => void): void;
    };
    const lastError: {
      message: string;
    } | undefined;
  }

  namespace tabCapture {
    function capture(options: { audio: boolean; video: boolean }, callback: (stream: MediaStream | null) => void): void;
  }
}

declare const chrome: typeof chrome;
