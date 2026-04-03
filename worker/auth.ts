// 简单的 JWT-like token 生成和验证
// Workers 环境中使用纯 JavaScript 实现，避免依赖

const TOKEN_EXPIRE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return atob(str);
}

async function sign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
}

async function verify(data: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  const expectedSignature = base64UrlDecode(signature);
  return await crypto.subtle.verify(
    'HMAC',
    key,
    new Uint8Array([...expectedSignature].map(c => c.charCodeAt(0))),
    encoder.encode(data)
  );
}

export async function createToken(userId: string, secret: string): Promise<string> {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64UrlEncode(JSON.stringify({
    sub: userId,
    iat: Date.now(),
    exp: Date.now() + TOKEN_EXPIRE_MS,
  }));
  const data = `${header}.${payload}`;
  const signature = await sign(data, secret);
  return `${data}.${signature}`;
}

export async function verifyToken(token: string, secret: string): Promise<string | null> {
  try {
    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature) return null;

    const data = `${header}.${payload}`;
    const isValid = await verify(data, signature, secret);
    if (!isValid) return null;

    const decoded = JSON.parse(base64UrlDecode(payload));
    if (decoded.exp && Date.now() > decoded.exp) return null;

    return decoded.sub;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  const url = new URL(request.url);
  return url.searchParams.get('token');
}
