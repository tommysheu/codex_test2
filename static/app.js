const chatEl = document.getElementById('chat');
const sendBtn = document.getElementById('sendBtn');
const questionEl = document.getElementById('question');
const modeEl = document.getElementById('mode');
const providerEl = document.getElementById('provider');
const manualToggleEl = document.getElementById('manualToggle');
const fileInputEl = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const fileList = document.getElementById('fileList');

const uploadedFiles = [];

function pushFileTag(file) {
  const li = document.createElement('li');
  li.textContent = `${file.filename} (${file.file_id.slice(0, 8)})`;
  fileList.appendChild(li);
}

uploadBtn.addEventListener('click', async () => {
  const files = [...fileInputEl.files];
  for (const f of files) {
    const form = new FormData();
    form.append('file', f);
    const res = await fetch('/api/upload', { method: 'POST', body: form });
    const data = await res.json();
    uploadedFiles.push({ file_id: data.file_id, filename: data.filename });
    pushFileTag(data);
  }
  fileInputEl.value = '';
});

function createExchange(question) {
  const wrap = document.createElement('div');
  wrap.className = 'exchange';

  const q = document.createElement('div');
  q.className = 'question-sticky';
  q.textContent = `Q: ${question}`;

  const a = document.createElement('div');
  a.className = 'answer';
  a.innerHTML = '<em>思考中...</em>';

  wrap.appendChild(q);
  wrap.appendChild(a);
  chatEl.prepend(wrap);
  return a;
}

async function sendQuestion() {
  const question = questionEl.value.trim();
  if (!question) return;

  const answerEl = createExchange(question);
  questionEl.value = '';

  const payload = {
    question,
    mode: modeEl.value,
    search_provider: providerEl.value,
    use_web_search: manualToggleEl.checked,
    file_ids: uploadedFiles.map(f => f.file_id),
  };

  const res = await fetch('/api/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let raw = '';
  let fullText = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    raw += decoder.decode(value, { stream: true });
    const parts = raw.split('\n\n');
    raw = parts.pop() || '';

    for (const part of parts) {
      if (!part.startsWith('data:')) continue;
      const dataStr = part.replace(/^data:\s*/, '').trim();
      if (dataStr === '[DONE]') continue;
      const data = JSON.parse(dataStr);

      if (data.type === 'token') {
        fullText += data.content;
        answerEl.innerHTML = marked.parse(fullText);
      } else if (data.type === 'search_results') {
        const list = data.results
          .map((r, i) => `${i + 1}. [${r.title}](${r.url})\n   - ${r.snippet || ''}`)
          .join('\n');
        answerEl.innerHTML += marked.parse(`\n\n---\n**網頁查詢結果**\n${list}`);
      }
    }
  }
}

sendBtn.addEventListener('click', sendQuestion);
questionEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendQuestion();
  }
});
