import type { Config, Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { requireAdmin } from '../lib/auth.js';
export default async (req: Request, context: Context) => {
  try {
    const store = getStore({ name: 'site-images', consistency: 'strong' });
    if (req.method === 'POST') {
      await requireAdmin();
      const file = await req.blob();
      const extensions: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
      if (!extensions[file.type] || !file.size || file.size > 4_000_000) return Response.json({ message: 'Gunakan JPG, PNG, WebP, atau GIF maksimal 4 MB.' }, { status: 400 });
      const key = `${crypto.randomUUID()}.${extensions[file.type]}`;
      await store.set(key, file);
      return Response.json({ success: true, data: `/api/media/${key}` });
    }
    if (req.method !== 'GET') return new Response(null, { status: 405 });
    const key = context.params.key;
    if (!/^[\w-]+\.(jpg|png|webp|gif)$/.test(key || '')) return new Response(null, { status: 404 });
    const data = await store.get(key, { type: 'arrayBuffer' });
    if (!data) return new Response(null, { status: 404 });
    return new Response(data, { headers: { 'Content-Type': `image/${key.endsWith('.jpg') ? 'jpeg' : key.split('.').pop()}`, 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' } });
  } catch (e) {
    if (e instanceof Response) return e;
    return Response.json({ message: 'Gambar gagal diproses.' }, { status: 503 });
  }
};
export const config: Config = { path: ['/api/media', '/api/media/:key'] };
