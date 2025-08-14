export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { objetivo, tempo, nivel, preferencia, foco, variant } = req.body || {};
  if (!objetivo || !tempo || !nivel || !preferencia || !foco) {
    return res.status(400).json({ error: 'Campos incompletos' });
  }

  // 🔒 se não houver API key, devolve um MOCK para demonstração (grátis)
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
  if (!OPENAI_API_KEY) {
    const mock = (variant === 'premium')
      ? `PLANO PREMIUM CRIATIVAMENTE — 7 DIAS
Dia 1: ... (atividade detalhada alinhada ao seu objetivo "${objetivo}")
Dia 2: ...
Dia 3: ...
Dia 4: ...
Dia 5: ...
Dia 6: ...
Dia 7: ...
EXERCÍCIOS CRIATIVOS (3): ...
REFLEXÕES GUIADAS (3): ...
RECURSOS: livros/vídeos conforme preferência (${preferencia}).
Mensagem final: Você começa hoje com ${tempo}/dia. Consistência vence intensidade esporádica.`
      : `Dia 1: atividade no formato ${preferencia} focando ${foco}.
Dia 2: prática guiada (nível ${nivel}) por ${tempo}.
Dia 3: revisão e microprojeto ligado ao objetivo "${objetivo}".
Exercício Criativo: conecte três palavras aleatórias em um parágrafo.
Pergunta Reflexiva: o que te trava mais e como reduzir isso em 10% amanhã?`;
    return res.status(200).json({ text: mock });
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

  const content = variant === 'premium' ? promptPremium : promptFree;

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: variant === 'premium' ? 0.65 : 0.7,
        messages: [{ role: 'system', content: system }, { role: 'user', content }]
      })
    });
    if (!r.ok) { const txt = await r.text(); return res.status(500).json({ error: 'OpenAI error', detail: txt }); }
    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content ?? '';
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: 'Server error', detail: String(e) });
  }
      }
