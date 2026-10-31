import { getUser, type User } from '@netlify/identity';
export function account(user: User) {
  return { id: user.id, name: user.name || String(user.userMetadata?.full_name || user.email || 'Jemaat'), email: user.email || '', role: user.roles?.includes('admin') ? 'admin' : 'user', createdAt: user.createdAt || '' };
}
export async function requireAdmin() {
  const user = await getUser();
  if (!user) throw new Response(JSON.stringify({ success: false, message: 'Silakan masuk kembali.' }), { status: 401 });
  if (!user.roles?.includes('admin')) throw new Response(JSON.stringify({ success: false, message: 'Hanya admin yang dapat mengubah data.' }), { status: 403 });
  return user;
}
