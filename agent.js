/**
 * IS_Agent_Alpha: Core Logic Layer (agent.js)
 * VERSION: AllOrigins Proxy + Optimized AI Logic
 */

const SUPABASE_URL = 'https://essquahbhmpehemjsmbq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_SR1YSCO6Nshdr227My-NTg_crmO_t_t';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const logWindow = document.getElementById('log-window');
const statusText = document.getElementById('status-text');

function agentLog(message) {
    const timestamp = new Date().toLocaleTimeString();
    logWindow.innerHTML += `<div style="margin-bottom: 5px;">[${timestamp}] ${message}</div>`;
    logWindow.scrollTop = logWindow.scrollHeight; 
}

async function runLearningCycle() {
    try {
        statusText.innerText = "Scraping via Proxy...";
        agentLog("<strong>Initiating AllOrigins bridge...</strong>");

        // 1. PERCEPTION (Using AllOrigins instead of Puter Fetch)
        const targetUrl = "https://news.ycombinator.com";
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
        
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error("Proxy connection failed.");
        
        const data = await response.json();
        const html = data.contents; // AllOrigins wraps the site in 'contents'
        
        // Clean the HTML to keep only text for the AI
        const cleanText = html.replace(/<[^>]*>/g, ' ').substring(0, 2000);
        agentLog("Data bridged and cleaned. Analyzing...");

        // 2. REASONING
        statusText.innerText = "Gemini is thinking...";
        const aiResponse = await puter.ai.chat({
            model: 'gemini-3.1-flash-lite-preview',
            messages: [{
                role: 'user', 
                content: `Task: Extract ONE tech trend. Output ONLY valid JSON: {"topic": "name", "summary": "1 sentence", "impact": 10}. Data: ${cleanText}`
            }]
        });

        // Handle both possible response formats in v2
        const content = aiResponse.text || aiResponse.message?.content;
        if (!content) throw new Error("AI Reasoning returned empty.");

        const knowledge = JSON.parse(content.replace(/```json|```/g, '').trim());
        agentLog(`Trend: <span style="color: #60a5fa;">${knowledge.topic}</span>`);

        // 3. PERSISTENCE
        statusText.innerText = "Syncing to Cloud...";
        const { error } = await _supabase
            .from('agent_knowledge')
            .insert([{ 
                topic: knowledge.topic, 
                content: knowledge.summary, 
                importance_score: knowledge.impact,
                source_url: targetUrl
            }]);

        if (error) throw error;

        agentLog("<span style='color: #22c55e;'>SUCCESS: Cloud Sync Complete.</span>");
        statusText.innerText = "Idle";

    } catch (err) {
        agentLog(`<span style="color: #ef4444;">Bridge Error: ${err.message}</span>`);
        statusText.innerText = "Standby";
    }
}

document.getElementById('start-btn').addEventListener('click', runLearningCycle);
agentLog("IS Agent v1.3 Bridge Mode Enabled.");
