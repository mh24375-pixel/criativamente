// api/generate.js — compatível com CommonJS e ESM + MOCK sem API key

async function handler(req, res) {
  try {
    // Permite GET para healthcheck e POST para gerar
    if (req.method === 'GET') {
      return res.status(200).json({ ok: true, route: '/api/generate' });
    }
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Body pode vir como string às vezes — parse defensivo
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch {}
    }

    const { objetivo, tempo, nivel, preferencia, foco, variant } = body || {};
    if (!objetivo || !tempo || !nivel || !preferencia || !foco) {
      return res.status(400).json({ error: 'Campos incompletos' });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

    // 🔒 Sem API key → sempre devolve MOCK (para demo funcionar)
    if (!OPENAI_API_KEY) {
      const mock = (variant === 'premium')
        ? `PLANO PREMIUM CRIATIVAMENTE — 7 DIAS
Dia 1: atividade alinhada ao objetivo "${objetivo}" (${tempo}/dia, nível ${nivel}).
Dia 2: prática no formato ${preferencia}.
Dia 3: microprojeto criativo focando ${foco}.
Dia 4: estudo dirigido + aplicação.
Dia 5: revisão com técnica Feynman.
Dia 6: desafio criativo (variação e restrição).
Dia 7: consolidação + próximos passos.
EXERCÍCIOS CRIATIVOS (3): variações temáticas.
REFLEXÕES (3): medos, alavancas, definição de “bom”.
RECURSOS: materiais no formato ${preferencia}.
Mensagem final: consistência diária de ${tempo} vence intensidade esporádica.`
        : `Dia 1: conteúdo em ${preferencia} com foco em ${foco}.
Dia 2: prática guiada (nível ${nivel}) por ${tempo}.
Dia 3: microprojeto ligado a "${objetivo}".
Exercício Criativo: conecte 3 palavras aleatórias em 1 parágrafo.
Pergunta Reflexiva: o que mais te trava e como reduzir 10% amanhã?`;
      return res.status(200).json({ text: mock, mock: true });
    }

    const system = `Você é a CriativaMente, especializada em planos personalizados de estudo,
exercícios criativos e reflexões de autoconhecimento. Escreva em PT-BR, tom motivador, claro e direto.`;

    const promptFree = `Dados do usuário:
- Objetivo: ${objetivo}
- Tempo diário: ${tempo}
- Nível: ${nivel}
- Preferência: ${preferencia}
- Foco: ${foco}

Tarefa (GRATUITO):
1) Plano de estudo para 3 dias (1 atividade/dia, no formato preferido, com justificativa breve).
2) 1 exercício criativo de desbloqueio.
3) 1 pergunta reflexiva.

Formate com títulos: Dia 1, Dia 2, Dia 3, Exercício Criativo, Pergunta Reflexiva.`;

    const promptPremium = `Dados do usuário:
- Objetivo: ${objetivo}
- Tempo diário: ${tempo}
- Nível: ${nivel}
- Preferência: ${preferencia}
- Foco: ${foco}

Gere o CONTEÚDO PREMIUM para PDF:

TÍTULO
"Plano Premium CriativaMente — 7 Dias"

SEÇÕES
1) Plano de estudo (Dias 1 a 7): 1 atividade detalhada/dia alinhada ao tempo e nível + 1 justificativa breve.
2) 3 Exercícios Criativos Exclusivos (diferentes do gratuito).
3) 3 Reflexões Guiadas.
4) Recursos Recomendados (3–6 itens conforme preferência).
5) Mensagem Final encorajadora.

Formato: subtítulos em CAIXA ALTA, listas numeradas, tom acolhedor e objetivo, PT-BR.`;

    const content = (variant === 'premium') ? promptPremium : promptFree;

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: (variant === 'premium') ? 0.65 : 0.7,
        messages: [{ role: 'system', content: system }, { role: 'user', content }]
      })
    });

    if (!r.ok) {
      const txt = await r.text();
      return res.status(500).json({ error: 'OpenAI error', detail: txt });
    }

    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content ?? '';
    return res.status(200).json({ text, mock: false });
  } catch (e) {
    return res.status(500).json({ error: 'Server error', detail: String(e) });
  }
}

// Exporta compatível com CJS e ESM:
module.exports = handler;
export default handler;
