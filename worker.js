import pg from 'pg';
const { Client } = pg;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};


async function handleRequest(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  const url = new URL(request.url);
  const path = url.pathname;

  if (!env.DATABASE_URL) {
    return jsonResponse({ error: 'Database not configured' }, 500);
  }

  const client = new Client({
    connectionString: env.DATABASE_URL,
  });

  try {
    await client.connect();

    if (path === '/api/greetings' && request.method === 'GET') {
      const result = await client.query('SELECT id, text FROM greetings ORDER BY id');
      return jsonResponse(result.rows);
    }

    if (path === '/api/greetings' && request.method === 'POST') {
      const { text } = await request.json();
      const result = await client.query(
        'INSERT INTO greetings (text) VALUES ($1) RETURNING id, text',
        [text]
      );
      return jsonResponse(result.rows[0], 201);
    }

    if (path === '/api/audiences' && request.method === 'GET') {
      const result = await client.query('SELECT id, text FROM audiences ORDER BY id');
      return jsonResponse(result.rows);
    }

    if (path === '/api/audiences' && request.method === 'POST') {
      const { text } = await request.json();
      const result = await client.query(
        'INSERT INTO audiences (text) VALUES ($1) RETURNING id, text',
        [text]
      );
      return jsonResponse(result.rows[0], 201);
    }

    if (path === '/api/combos' && request.method === 'GET') {
      const result = await client.query(`
        SELECT 
          c.id,
          c.greeting_id,
          c.audience_id,
          g.text as greeting_text,
          a.text as audience_text
        FROM combos c
        JOIN greetings g ON c.greeting_id = g.id
        JOIN audiences a ON c.audience_id = a.id
        ORDER BY c.id DESC
      `);
      return jsonResponse(result.rows);
    }

    if (path === '/api/combos' && request.method === 'POST') {
      const { greeting_id, audience_id } = await request.json();
      const result = await client.query(
        'INSERT INTO combos (greeting_id, audience_id) VALUES ($1, $2) RETURNING id, greeting_id, audience_id',
        [greeting_id, audience_id]
      );
      return jsonResponse(result.rows[0], 201);
    }

    return jsonResponse({ error: 'Not found' }, 404);

  } catch (error) {
    console.error('Database error:', error);
    return jsonResponse({ error: error.message }, 500);
  } finally {
    await client.end();
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

export default {
  async fetch(request, env) {
    return handleRequest(request, env);
  }
};
