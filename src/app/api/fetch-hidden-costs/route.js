import fetchHiddenCosts from '@/scripts/fetchHiddenCosts';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) {
    return new Response(JSON.stringify({ error: 'URL is required' }), { status: 400 });
  }

  try {
    const hiddenCosts = await fetchHiddenCosts(url);
    return new Response(JSON.stringify(hiddenCosts), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
