export async function analyzeIssueClient(title, description) {
  try {
    const resp = await fetch('http://localhost:3001/api/analyze-issue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description })
    });
    const json = await resp.json();
    if (!json.ok) throw new Error(json.error || 'AI server error');
    return json.data; // { summary, suggestedPriority, suggestedStatus, hints }
  } catch (err) {
    console.error('analyzeIssueClient error', err);
    return null;
  }
}
