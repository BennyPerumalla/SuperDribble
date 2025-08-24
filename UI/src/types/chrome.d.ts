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
  }
}

declare const chrome: typeof chrome;
