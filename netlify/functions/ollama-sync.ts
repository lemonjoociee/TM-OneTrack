/**
 * Netlify Function: ollama-sync
 * 
 * Proxies or simulates health checks and ingestion triggers for local Ollama AI
 * and Outlook / WhatsApp sync operations.
 */

export const handler = async (event: any) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const ollamaHost = process.env.VITE_OLLAMA_ENDPOINT || 'http://localhost:11434';
  const modelName = process.env.VITE_OLLAMA_MODEL || 'llama3';

  try {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'success',
        engine: 'Ollama Local AI',
        model: modelName,
        endpoint: ollamaHost,
        timestamp: new Date().toISOString(),
        outlookScanFolder: process.env.VITE_OUTLOOK_SCAN_FOLDER || 'Inbox/Nubitel Issues',
        whatsappScanFolder: process.env.VITE_WHATSAPP_FOLDER || 'C:\\Users\\fayiz.m\\NOC Tracker v4\\WhatsApp',
        message: 'Ollama AI ingestion pipeline ready.'
      })
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        status: 'error',
        message: error.message || 'Error communicating with Ollama ingestion worker.'
      })
    };
  }
};
