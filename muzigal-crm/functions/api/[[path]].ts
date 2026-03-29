// Cloudflare Workers CORS Proxy
// Proxies requests from the frontend to the Google Apps Script backend
// Solves CORS restrictions that prevent direct browser → GAS calls

interface Env {
  GAS_URL: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const gasUrl = env.GAS_URL;

  if (!gasUrl) {
    return new Response(JSON.stringify({ error: 'GAS_URL not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  try {
    const url = new URL(request.url);
    const targetUrl = new URL(gasUrl);

    // Forward query params
    url.searchParams.forEach((value, key) => {
      targetUrl.searchParams.set(key, value);
    });

    const fetchOptions: RequestInit = {
      method: request.method,
      redirect: 'follow',
    };

    if (request.method === 'POST') {
      fetchOptions.headers = { 'Content-Type': 'application/json' };
      fetchOptions.body = await request.text();
    }

    const response = await fetch(targetUrl.toString(), fetchOptions);
    const body = await response.text();

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(),
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(),
      },
    });
  }
};

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}
