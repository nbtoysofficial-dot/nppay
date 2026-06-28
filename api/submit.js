// api/submit.js — รับข้อมูลจากฟอร์มแล้วบันทึกลง Google Sheets
// Vercel Serverless Function

const SHEET_ID  = process.env.GOOGLE_SHEET_ID;
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const PRIVATE_KEY  = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

async function getAccessToken() {
  const { SignJWT } = await import('jose');
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToBuffer(PRIVATE_KEY),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const jwt = await new SignJWT({
    scope: 'https://www.googleapis.com/auth/spreadsheets',
  })
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuer(CLIENT_EMAIL)
    .setAudience('https://oauth2.googleapis.com/token')
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(key);

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  const data = await res.json();
  return data.access_token;
}

function pemToBuffer(pem) {
  const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s/g, '');
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;

    // คอลัมน์ตามลำดับใน Google Sheets
    const row = [
      new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }),
      data.lineDisplayName || '',
      data.type            || '',
      data.name            || '',
      data.address         || '',
      data.taxId           || '',
      data.phone           || '',
      data.email           || '',
      data.position        || '',
      data.duties          || '',
      data.venue           || '',
      data.taxRate         || '',
      data.taxLaw          || '',
      data.bankName        || '',
      data.bankAccountName || '',
      data.bankAccountNo   || '',
      data.notes           || '',
      data.lineUserId      || '',
    ];

    const token = await getAccessToken();

    const sheetRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/ข้อมูลพนักงาน!A:R:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: [row] }),
      }
    );

    if (!sheetRes.ok) {
      const errText = await sheetRes.text();
      throw new Error(`Sheets API error: ${errText}`);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Submit error:', err);
    return res.status(500).json({ error: err.message });
  }
}
