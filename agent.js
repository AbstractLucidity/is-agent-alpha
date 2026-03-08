/**
 * IS_Agent_Alpha: v1.5 (Control & Autonomy Fix)
 */

const SUPABASE_URL = 'https://essquahbhmpehemjsmbq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_SR1YSCO6Nshdr227My-NTg_crmO_t_t';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const logWindow = document.getElementById('log-window');
const statusText = document.getElementById('status-text');
const pulse = document.getElementById('pulse');
const autoBtn = document.getElementById('auto-btn');

let isAutoEnabled = false; // Track the state
let autoTimeout = null;

function agentLog(message) {
    const timestamp = new Date().toLocaleTimeString();
    logWindow.innerHTML += `<div style="margin-bottom: 5px;">[${timestamp}] ${message}</div>`;
    logWindow.scrollTop = logWindow.scrollHeight; 
}

async function runLearningCycle() {
    try {
        pulse.className = 'active';
        statusText.innerText = "Scanning...";
        
        // 1. PERCEPTION
        const targetUrl = "https://news.ycombinator.com";
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
        const response = await fetch(proxyUrl);
        const data = await response.json();
        const cleanText = data.contents.replace(/<[^>]*>/g, ' ').substring(0, 1500);

        // 2. REASONING
        const aiResponse = await puter.ai.chat({
            model: 'gemini-3.1-flash-lite-preview',
            messages: [{
                role: 'user', 
                content: `JSON ONLY: {"topic": "name", "summary": "1 sentence", "impact": 10}. Data: ${cleanText}`
            }]
        });

        const content = aiResponse.text || aiResponse.message?.content;
        const knowledge = JSON.parse(content.replace(/```json|```/g, '').trim());
        agentLog(`Discovery: <span style="color: #60a5fa;">${knowledge.topic}</span>`);

        // 3. PERSISTENCE
        await _supabase.from('agent_knowledge').insert([{ 
            topic: knowledge.topic, 
            content: knowledge.summary, 
            importance_score: knowledge.impact,
            source_url: targetUrl
        }]);

        agentLog("<span style='color: #22c55e;'>SUCCESS: Knowledge Saved.</span>");
        
    } catch (err) {
        agentLog(`<span style="color: #ef4444;">Error: ${err.message}</span>`);
    } finally {
        pulse.className = 'idle';
        statusText.innerText = isAutoEnabled ? "Waiting for next cycle..." : "System Idle";
        
        // Only reschedule if Auto is still ON
        if (isAutoEnabled) {
            autoTimeout = setTimeout(runLearningCycle, 900000); 
            agentLog("Next auto-scan in 15m.");
        }
    }
}

// TOGGLE LOGIC
autoBtn.onclick = () => {
    isAutoEnabled = !isAutoEnabled;
    
    if (isAutoEnabled) {
        autoBtn.innerText = "Toggle Autonomy: ON";
        autoBtn.style.background = "#22c55e";
        agentLog("<strong>Autonomy Enabled. Starting first cycle...</strong>");
        runLearningCycle();
    } else {
        autoBtn.innerText = "Toggle Autonomy: OFF";
        autoBtn.style.background = "#475569";
        clearTimeout(autoTimeout);
        agentLog("Autonomy Disabled. Sequence stopped.");
    }
};

// MANUAL START
document.getElementById('start-btn').onclick = () => {
    agentLog("Manual scan initiated.");
    runLearningCycle();
};

window.onload = () => agentLog("System Ready. Click 'Toggle Autonomy' to start Auto-Pilot.");
