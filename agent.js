/**
 * IS_Agent_Alpha: Core Logic Layer (Fixed)
 */

const SUPABASE_URL = 'https://essquahbhmpehemjsmbq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_SR1YSCO6Nshdr227My-NTg_crmO_t_t';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const logWindow = document.getElementById('log-window');
const statusText = document.getElementById('status-text');

function agentLog(message) {
    const timestamp = new Date().toLocaleTimeString();
    logWindow.innerHTML += `<div>[${timestamp}] ${message}</div>`;
    logWindow.scrollTop = logWindow.scrollHeight; 
}

async function runLearningCycle() {
    try {
        statusText.innerText = "Scanning Tech Feeds...";
        
        // 1. FETCH & CLEAN
        const response = await puter.net.fetch("https://news.ycombinator.com");
        let html = await response.text();
        // Remove everything but readable text to save tokens and avoid content filter
        const cleanText = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").substring(0, 1500);

        agentLog("Data cleaned. Requesting Gemini Analysis...");

        // 2. REASONING
        statusText.innerText = "Gemini is thinking...";
        const aiResponse = await puter.ai.chat(`Task: Analyze this text and identify ONE major tech trend. Return ONLY JSON in this format: {"topic": "string", "summary": "string", "impact": 10}. Data: ${cleanText}`);

        // 3. ROBUST PARSING (Handle v2 object structures)
        // Puter v2 often returns an object with a .message or .content property
        let rawContent = typeof aiResponse === 'object' ? (aiResponse.message?.content || aiResponse.content || JSON.stringify(aiResponse)) : aiResponse;
        
        const jsonMatch = rawContent.match(/\{.*\}/s);
        if (!jsonMatch) throw new Error("AI failed to return valid JSON format.");
        
        const knowledge = JSON.parse(jsonMatch[0]);
        agentLog(`Trend: <span style="color: #60a5fa;">${knowledge.topic}</span>`);

        // 4. PERSISTENCE
        statusText.innerText = "Saving to Cloud...";
        const { error } = await _supabase.from('agent_knowledge').insert([{ 
            topic: knowledge.topic, 
            content: knowledge.summary, 
            importance_score: knowledge.impact
        }]);

        if (error) throw error;

        agentLog("<span style='color: #22c55e;'>SUCCESS: Saved to Supabase!</span>");
        statusText.innerText = "Idle";

    } catch (err) {
        console.error("DEBUG ERROR:", err);
        agentLog(`<span style="color: #ef4444;">System Error: ${err.message}</span>`);
        statusText.innerText = "Standby";
    }
}

document.getElementById('start-btn').addEventListener('click', runLearningCycle);
agentLog("IS Agent v1.2 Online");
