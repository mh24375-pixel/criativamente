// api/generate.js — MOCK (funciona sem API Key)
export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { 'content-type': 'application/json' }
    });
  }

  let body = {};
  try { body = await req.json(); } catch {}

  const {
    objetivo = '(sem objetivo)',
    tempo = '(sem tempo)',
    nivel = '(sem nível)',
    preferencia = '(sem preferência)',
    foco = '(sem foco)',
    variant = 'free'
  } = body || {};

  const text = (variant === 'premium')
    ? `PLANO PREMIUM — 7 DIAS\nDia 1: Atividade alinhada ao objetivo "${objetivo}" (${tempo}/dia, nível ${nivel}, formato ${preferencia}).\nDia 2: Prática guiada focando ${foco}.\nDia 3: Microprojeto criativo.\nDia 4: Estudo dirigido + aplicação.\nDia 5: Revisão com técnica Feynman.\nDia 6: Desafio criativo.\nDia 7: Consolidação + próximos passos.`
    : `Plano gratuito:\nDia 1: Conteúdo em ${preferencia} com foco em ${foco}.\nDia 2: Prática guiada (nível ${nivel}) por ${tempo}.\nDia 3: Microprojeto ligado ao objetivo "${objetivo}".`;

  return new Response(JSON.stringify({ text, mock: true }), {
    status: 200, headers: { 'content-type': 'application/json' }
  });
      }
