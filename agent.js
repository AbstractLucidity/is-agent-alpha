// Initialization
const SUPABASE_URL = 'https://essquahbhmpehemjsmbq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_SR1YSCO6Nshdr227My-NTg_crmO_t_t';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const logWindow = document.getElementById('log-window');
const statusText = document.getElementById('status-text');
const pulse = document.getElementById('pulse');

function agentLog(message) {
    const timestamp = new Date().toLocaleTimeString();
    logWindow.innerHTML += `<div><span style="color:#475569">[${timestamp}]</span> ${message}</div>`;
    logWindow.scrollTop = logWindow.scrollHeight; 
}

async function runLearningCycle() {
    try {
        statusText.innerText = "Scanning...";
        pulse.className = "active";
        
        const response = await puter.net.fetch("https://news.ycombinator.com");
        const text = await response.text();
        const cleanText = text.replace(/<[^>]*>/g, " ").substring(0, 2000);

        agentLog("Analysis requested...");

        const aiResponse = await puter.ai.chat({
            model: 'gemini-3.1-flash-lite-preview',
            messages: [{
                role: 'user', 
                content: `Task: Identify ONE tech trend. Output ONLY JSON: {"topic": "name", "summary": "1 sentence", "impact": 10}. Data: ${cleanText}`
            }]
        });

        const knowledge = JSON.parse(aiResponse.replace(/```json|```/g, '').trim());
        agentLog(`Detected: <b>${knowledge.topic}</b>`);

        const { error } = await supabaseClient
            .from('agent_knowledge')
            .insert([{ 
                topic: knowledge.topic, 
                content: knowledge.summary, 
                importance_score: knowledge.impact
            }]);

        if (error) throw error;

        agentLog("<span style='color: #22c55e;'>Successfully synced to cloud.</span>");
        statusText.innerText = "Idle";
        pulse.className = "idle";

    } catch (err) {
        console.error(err);
        agentLog(`<span style="color: #ef4444;">Error: ${err.message}</span>`);
        statusText.innerText = "Error";
        pulse.className = "idle";
    }
}

document.getElementById('start-btn').addEventListener('click', runLearningCycle);
agentLog("System Online. Standing by.");
