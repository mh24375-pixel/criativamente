const form = document.getElementById('form');
const output = document.getElementById('output');
const resultEl = document.getElementById('result');
const btnCopy = document.getElementById('copy');
const btnPremium = document.getElementById('btnPremium');
const buyLink = document.getElementById('buy');
let mode = 'free';

btnPremium.addEventListener('click', () => {
  mode = 'premium';
  buyLink.href = '#'; // coloque seu checkout quando tiver
  form.requestSubmit();
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const payload = {
    objetivo: fd.get('objetivo')?.trim(),
    tempo: fd.get('tempo')?.trim(),
    nivel: fd.get('nivel'),
    preferencia: fd.get('preferencia'),
    foco: fd.get('foco'),
    variant: mode
  };
  resultEl.textContent = 'Gerando seu plano...'; output.hidden = false;
  try {
    const res = await fetch('/api/generate', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Falha na geração');
    const data = await res.json();
    resultEl.textContent = data.text || 'Sem conteúdo retornado.';
  } catch (err) {
    resultEl.textContent = 'Ocorreu um erro. Tente novamente.'; console.error(err);
  } finally { mode = 'free'; }
});

btnCopy.addEventListener('click', async () => {
  const txt = resultEl.textContent.trim(); if (!txt) return;
  await navigator.clipboard.writeText(txt);
  btnCopy.textContent = 'Copiado!'; setTimeout(()=>btnCopy.textContent='Copiar',1200);
});
