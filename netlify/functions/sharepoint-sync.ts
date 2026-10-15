/**
 * Netlify Function: sharepoint-sync
 * 
 * Secure backend function for synchronizing with Microsoft SharePoint Online
 * via Microsoft Graph API without exposing client secrets or tenant tokens to the browser.
 */

interface SharePointAuthResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
}

export const handler = async (event: any) => {
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const tenantId = process.env.SHAREPOINT_TENANT_ID;
  const clientId = process.env.SHAREPOINT_CLIENT_ID;
  const clientSecret = process.env.SHAREPOINT_CLIENT_SECRET;
  const siteId = process.env.SHAREPOINT_SITE_ID;
  const listId = process.env.SHAREPOINT_LIST_ID;

  // Fallback to sample/cached notification if SharePoint environment variables are not yet configured in Netlify
  if (!tenantId || !clientId || !clientSecret) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'notice',
        message: 'SharePoint environment variables not configured in Netlify. Falling back to local cache/sample mode.',
        isConfigured: false,
        timestamp: new Date().toISOString(),
        items: []
      })
    };
  }

  try {
    // 1. Acquire OAuth App-Only Token from Microsoft identity platform
    const tokenEndpoint = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    const tokenParams = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials'
    });

    const tokenRes = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString()
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      throw new Error(`Failed to authenticate with Microsoft Graph: ${tokenRes.status} ${errText}`);
    }

    const tokenData = (await tokenRes.json()) as SharePointAuthResponse;
    const accessToken = tokenData.access_token;

    // 2. Fetch Issues from target SharePoint List
    const graphEndpoint = `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listId}/items?expand=fields`;
    const listRes = await fetch(graphEndpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    });

    if (!listRes.ok) {
      const errText = await listRes.text();
      throw new Error(`Failed to query SharePoint list items: ${listRes.status} ${errText}`);
    }

    const listData = await listRes.json();
    const items = (listData.value || []).map((entry: any) => ({
      id: entry.id,
      ...entry.fields
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'success',
        isConfigured: true,
        timestamp: new Date().toISOString(),
        count: items.length,
        data: items
      })
    };
  } catch (error: any) {
    console.error('SharePoint synchronization failed:', error);
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({
        status: 'error',
        message: error.message || 'Error communicating with SharePoint Graph API.',
        timestamp: new Date().toISOString()
      })
    };
  }
};
