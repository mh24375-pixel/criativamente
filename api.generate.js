// api/generate.js — versão EDGE + MOCK (sempre responde 200)
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

  // ⚠️ MOCK: sempre gera um texto válido (sem chave, sem erro)
  const text = (variant === 'premium')
    ? `PLANO PREMIUM CRIATIVAMENTE — 7 DIAS
Dia 1: atividade alinhada ao objetivo "${objetivo}" (${tempo}/dia, nível ${nivel}, formato ${preferencia}).
Dia 2: prática guiada focando ${foco}.
Dia 3: microprojeto criativo.
Dia 4: estudo dirigido + aplicação.
Dia 5: revisão com técnica Feynman.
Dia 6: desafio criativo (variação e restrição).
Dia 7: consolidação + próximos passos.
EXERCÍCIOS CRIATIVOS (3): variações temáticas e restrições formais.
REFLEXÕES (3): medos, alavancas, definição de “bom”.
RECURSOS: materiais no formato ${preferencia}.
Mensagem final: consistência diária de ${tempo} vence intensidade esporádica.`
    : `Dia 1: conteúdo em ${preferencia} com foco em ${foco}.
Dia 2: prática guiada (nível ${nivel}) por ${tempo}.
Dia 3: microprojeto ligado ao objetivo "${objetivo}".
Exercício Criativo: conecte 3 palavras aleatórias em 1 parágrafo.
Pergunta Reflexiva: o que mais te trava e como reduzir 10% amanhã?`;

  return new Response(JSON.stringify({ text, mock: true }), {
    status: 200, headers: { 'content-type': 'application/json' }
  });
}
