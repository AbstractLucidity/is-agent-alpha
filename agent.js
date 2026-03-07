/**
 * IS_Agent_Alpha: Core Logic Layer (agent.js)
 */

const SUPABASE_URL = 'https://essquahbhmpehemjsmbq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_SR1YSCO6Nshdr227My-NTg_crmO_t_t';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const logWindow = document.getElementById('log-window');
const statusText = document.getElementById('status-text');

function agentLog(message) {
    const timestamp = new Date().toLocaleTimeString();
    logWindow.innerHTML += `<div><span style="color:#64748b">[${timestamp}]</span> ${message}</div>`;
    logWindow.scrollTop = logWindow.scrollHeight; 
}

async function runLearningCycle() {
    try {
        statusText.innerText = "Scanning...";
        
        // 1. Scrape
        const response = await puter.net.fetch("https://news.ycombinator.com");
        const html = await response.text();
        // Clean text: strip tags and limit size for context
        const cleanText = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").substring(0, 2000);

        agentLog("Analysis requested...");

        // 2. AI Reasoning (Using modern object syntax)
        // Ensure you pass options as a single object
        const aiResponse = await puter.ai.chat({
            model: 'gemini-3.1-flash-lite-preview',
            messages: [{
                role: 'user', 
                content: `Task: Identify ONE tech trend from this text. Output ONLY valid JSON: {"topic": "name", "summary": "1 sentence", "impact": 10}. Data: ${cleanText}`
            }]
        });

        // 3. Robust Parsing
        // In v2, the response is often an object containing a 'message' property
        const content = aiResponse?.message?.content || aiResponse;
        if (!content) throw new Error("AI returned an empty response.");

        // Extract JSON string if AI added conversational filler
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("AI output was not valid JSON");
        
        const knowledge = JSON.parse(jsonMatch[0]);
        agentLog(`Detected: <b>${knowledge.topic}</b>`);

        // 4. Persistence
        const { error } = await supabaseClient
            .from('agent_knowledge')
            .insert([{ 
                topic: knowledge.topic, 
                content: knowledge.summary, 
                importance_score: knowledge.impact
            }]);

        if (error) throw error;

        agentLog("<span style='color: #22c55e;'>Saved to Supabase.</span>");
        statusText.innerText = "Idle";

    } catch (err) {
        console.error("Agent Logic Error:", err);
        agentLog(`<span style="color: #ef4444;">Error: ${err.message}</span>`);
        statusText.innerText = "Error";
    }
}

document.getElementById('start-btn').addEventListener('click', runLearningCycle);
agentLog("System Online. Ready.");
