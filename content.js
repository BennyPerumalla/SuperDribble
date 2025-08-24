// Content script for Super Dribble Audio Amplifier
// This script is injected into web pages to ensure the extension is active

console.log('Super Dribble Audio Amplifier content script loaded');

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);
  
  // Handle any page-specific audio processing if needed
  switch (request.action) {
    case 'ping':
      sendResponse({ success: true, message: 'Content script is active' });
      break;
      
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
  
  return true;
});

// Notify background script that content script is ready
chrome.runtime.sendMessage({ 
  action: 'content_script_ready',
  url: window.location.href,
  title: document.title 
});
