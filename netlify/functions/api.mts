import type { Config } from '@netlify/functions';
import { getUser, admin } from '@netlify/identity';
import { eq, sql } from 'drizzle-orm';
import { database } from '../../db/index.js';
import { siteData } from '../../db/schema.js';
import { DEFAULT_CONTENT, DEFAULT_CONFIG, DEFAULT_VIDEOS } from '../../src/defaults.js';
import { account, requireAdmin } from '../lib/auth.js';

function reply(data: unknown, status = 200) { return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } }); }
export default async (req: Request) => {
  try {
    const path = new URL(req.url).pathname.replace(/^\/api\//, '');
    if (path === 'auth/session' && req.method === 'GET') {
      const user = await getUser();
      return reply({ success: true, user: user ? account(user) : null });
    }
    const defaults = { content: DEFAULT_CONTENT, config: DEFAULT_CONFIG, videos: DEFAULT_VIDEOS };
    const key = path as keyof typeof defaults;
    if (Object.hasOwn(defaults, key)) {
      const db = database();
      if (req.method === 'GET') {
        const [row] = await db.select().from(siteData).where(eq(siteData.key, key));
        return reply({ success: true, data: row?.value ?? defaults[key] });
      }
      if (req.method !== 'POST') return reply({ success: false, message: 'Metode tidak didukung.' }, 405);
      await requireAdmin();
      const value = await req.json();
      if (key === 'config') {
        if (!value || Array.isArray(value) || Object.keys(DEFAULT_CONFIG).some(k => typeof value[k] !== 'string' || value[k].length > 4000)) return reply({ success: false, message: 'Pengaturan tidak valid.' }, 400);
        if (!/^(https:\/\/|\/api\/media\/)/.test(value.bannerImage)) return reply({ success: false, message: 'Gunakan gambar unggahan atau URL HTTPS.' }, 400);
      } else {
        if (!Array.isArray(value) || value.length > 2000 || value.some(v => !v || typeof v.id !== 'string' || !v.id || typeof v.title !== 'string' || !v.title.trim() || typeof v.description !== 'string' || (key === 'content' ? typeof v.content !== 'string' || !['Renungan', 'Doa', 'Ayat', 'Akhir Zaman'].includes(v.category) : !/^[\w-]{11}$/.test(v.youtubeId)))) return reply({ success: false, message: 'Data konten tidak valid.' }, 400);
      }
      if (JSON.stringify(value).length > 2_000_000) return reply({ success: false, message: 'Data terlalu besar.' }, 413);
      await db.insert(siteData).values({ key, value }).onConflictDoUpdate({ target: siteData.key, set: { value, updatedAt: new Date() } });
      return reply({ success: true, data: value });
    }
    await requireAdmin();
    if (path === 'users' && req.method === 'GET') return reply({ success: true, data: (await admin.listUsers()).map(account) });
    if (path === 'database/status' || path === 'database/test' || path === 'database/sync') {
      const started = Date.now();
      await database().execute(sql`select 1`);
      return reply({ success: true, message: 'Database online terhubung.', data: { status: 'connected', provider: 'server_api', latencyMs: Date.now() - started, lastSync: new Date().toISOString(), serverTime: new Date().toISOString(), endpointUrl: '/api', message: 'Netlify Database online' } });
    }
    if (path === 'database/config' && req.method === 'GET') return reply({ success: true, data: { provider: 'server_api', endpointUrl: '/api', apiKey: '', databaseName: 'Netlify Database', autoSync: true, status: 'connected' } });
    if (path === 'reset-defaults' && req.method === 'POST') {
      await database().insert(siteData).values(Object.entries(defaults).map(([key, value]) => ({ key, value }))).onConflictDoUpdate({ target: siteData.key, set: { value: sql`excluded.value`, updatedAt: new Date() } });
      return reply({ success: true, data: defaults });
    }
    return reply({ success: false, message: 'Endpoint tidak ditemukan.' }, 404);
  } catch (error) {
    if (error instanceof Response) return reply(await error.json(), error.status);
    return reply({ success: false, message: 'Server belum dapat memproses permintaan. Silakan coba lagi.' }, 503);
  }
};
export const config: Config = { path: '/api/*' };
