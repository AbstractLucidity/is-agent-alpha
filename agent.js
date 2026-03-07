/**
 * IS_Agent_Alpha: v1.4 (Full Autonomy)
 * STRATEGY: Self-Starting Recursive Cycles
 */

const SUPABASE_URL = 'https://essquahbhmpehemjsmbq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_SR1YSCO6Nshdr227My-NTg_crmO_t_t';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const logWindow = document.getElementById('log-window');
const statusText = document.getElementById('status-text');
const pulse = document.getElementById('pulse');

function agentLog(message) {
    const timestamp = new Date().toLocaleTimeString();
    logWindow.innerHTML += `<div style="margin-bottom: 5px;">[${timestamp}] ${message}</div>`;
    logWindow.scrollTop = logWindow.scrollHeight; 
}

// THE CORE LOGIC
async function runLearningCycle() {
    try {
        pulse.className = 'active';
        statusText.innerText = "Auto-Scanning...";
        
        // 1. PERCEPTION
        const targetUrl = "https://news.ycombinator.com";
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
        const response = await fetch(proxyUrl);
        const data = await response.json();
        const cleanText = data.contents.replace(/<[^>]*>/g, ' ').substring(0, 2000);

        // 2. REASONING
        const aiResponse = await puter.ai.chat({
            model: 'gemini-3.1-flash-lite-preview',
            messages: [{
                role: 'user', 
                content: `Identify ONE tech trend from this: ${cleanText}. Return ONLY JSON: {"topic": "name", "summary": "1 sentence", "impact": 10}`
            }]
        });

        const content = aiResponse.text || aiResponse.message?.content;
        const knowledge = JSON.parse(content.replace(/```json|```/g, '').trim());
        agentLog(`Auto-Discovery: <span style="color: #60a5fa;">${knowledge.topic}</span>`);

        // 3. PERSISTENCE
        await _supabase.from('agent_knowledge').insert([{ 
            topic: knowledge.topic, 
            content: knowledge.summary, 
            importance_score: knowledge.impact,
            source_url: targetUrl
        }]);

        agentLog("<span style='color: #22c55e;'>SUCCESS: Cycle Complete.</span>");
        
    } catch (err) {
        agentLog(`<span style="color: #ef4444;">Cycle Skipped: ${err.message}</span>`);
    } finally {
        statusText.innerText = "Waiting for next cycle...";
        pulse.className = 'idle';
        // RECURSIVE CALL: Schedules the next run in 15 minutes
        setTimeout(runLearningCycle, 900000); 
        agentLog("Next autonomous scan scheduled in 15m.");
    }
}

// INITIALIZATION: Start first scan 5 seconds after load
window.onload = () => {
    agentLog("<strong>System Online. Initializing Auto-Pilot...</strong>");
    setTimeout(runLearningCycle, 5000); 
};
