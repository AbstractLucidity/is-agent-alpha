/**
 * IS_Agent_Alpha: Core Logic Layer (agent.js)
 * STRATEGY: Official Puter.js v2 Quick-Start Syntax
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

async function runLearningCycle() {
    try {
        pulse.className = 'active';
        statusText.innerText = "Scanning...";
        agentLog("<strong>Initiating live scan...</strong>");

        // STEP 1: PERCEPTION
        const response = await puter.net.fetch("https://news.ycombinator.com");
        const html = await response.text();
        agentLog("Data received. Thinking...");

        // STEP 2: REASONING (Matching your provided documentation)
        statusText.innerText = "Gemini is thinking...";
        
        // We use the simpler string-based prompt shown in the doc
        const aiResponse = await puter.ai.chat(
            `Find ONE tech trend in this text. Return ONLY JSON: {"topic": "name", "summary": "1 sentence", "impact": 10}. Text: ${html.substring(0, 3000)}`
        );

        // Based on the doc, the response is usually the text itself
        const cleanJsonText = aiResponse.toString().replace(/```json|```/g, '').trim();
        const knowledge = JSON.parse(cleanJsonText);
        
        agentLog(`Trend: <span style="color: #60a5fa;">${knowledge.topic}</span>`);

        // STEP 3: PERSISTENCE
        statusText.innerText = "Saving...";
        const { error } = await _supabase
            .from('agent_knowledge')
            .insert([{ 
                topic: knowledge.topic, 
                content: knowledge.summary, 
                importance_score: knowledge.impact,
                source_url: "https://news.ycombinator.com"
            }]);

        if (error) throw error;

        agentLog("<span style='color: #22c55e;'>SUCCESS: Saved to Cloud.</span>");
        statusText.innerText = "Idle";
        pulse.className = 'idle';

    } catch (err) {
        agentLog(`<span style="color: #ef4444;">Error: ${err.message}</span>`);
        statusText.innerText = "Standby";
        pulse.className = 'idle';
    }
}

document.getElementById('start-btn').addEventListener('click', runLearningCycle);
agentLog("IS Agent v1.0 Initialized with v2 Library.");
