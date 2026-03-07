/**
 * IS_Agent_Alpha: Core Logic Layer (agent.js)
 * VERSION: Clean Sweep (Final Fix for Undefined Errors)
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
        statusText.innerText = "Scanning Tech Feeds...";
        
        // 1. GET DATA
        const response = await puter.net.fetch("https://news.ycombinator.com");
        let text = await response.text();
        
        // 2. CLEAN DATA (Remove scripts/tags so AI doesn't get confused)
        const cleanText = text.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gmb, "")
                              .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gmb, "")
                              .replace(/<[^>]*>/g, " ")
                              .substring(0, 2000);

        agentLog("Data cleaned. Requesting Gemini Analysis...");

        // 3. REASONING (The specific v2 Object Format)
        statusText.innerText = "Gemini is thinking...";
        const aiResponse = await puter.ai.chat({
            model: 'gemini-3.1-flash-lite-preview',
            messages: [{
                role: 'user', 
                content: `Task: Identify ONE tech trend. Output ONLY JSON: {"topic": "name", "summary": "1 sentence", "impact": 10}. Data: ${cleanText}`
            }]
        });

        // ERROR CHECK: If Puter returns a weird object, we grab the right part
        const aiResult = aiResponse.message?.content || aiResponse.text || aiResponse;
        
        if (!aiResult) throw new Error("AI returned no content.");

        const knowledge = JSON.parse(aiResult.replace(/```json|```/g, '').trim());
        agentLog(`Trend Identified: <span style="color: #60a5fa;">${knowledge.topic}</span>`);

        // 4. PERSISTENCE
        statusText.innerText = "Saving to Cloud...";
        const { error } = await _supabase
            .from('agent_knowledge')
            .insert([{ 
                topic: knowledge.topic, 
                content: knowledge.summary, 
                importance_score: knowledge.impact,
                source_url: "https://news.ycombinator.com"
            }]);

        if (error) throw error;

        agentLog("<span style='color: #22c55e;'>SUCCESS: Saved to Supabase!</span>");
        statusText.innerText = "Idle";

    } catch (err) {
        agentLog(`<span style="color: #ef4444;">System Error: ${err.message}</span>`);
        statusText.innerText = "Standby";
    }
}

document.getElementById('start-btn').addEventListener('click', runLearningCycle);
agentLog("IS Agent v1.2 Online (Production Mode)");
