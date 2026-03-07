/**
 * IS_Agent_Alpha: Core Logic Layer (agent.js)
 * DEPLOYMENT VERSION: GitHub Pages Stable
 */

// 1. SYSTEM CONFIGURATION
const SUPABASE_URL = 'https://essquahbhmpehemjsmbq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_SR1YSCO6Nshdr227My-NTg_crmO_t_t';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const logWindow = document.getElementById('log-window');
const statusText = document.getElementById('status-text');
const pulse = document.getElementById('pulse');
const autoBtn = document.getElementById('auto-btn');

let autoInterval = null;

function agentLog(message) {
    const timestamp = new Date().toLocaleTimeString();
    logWindow.innerHTML += `<div style="margin-bottom: 5px;">[${timestamp}] ${message}</div>`;
    logWindow.scrollTop = logWindow.scrollHeight; 
}

/**
 * THE CORE LEARNING CYCLE
 */
async function runLearningCycle() {
    try {
        pulse.className = 'active';
        statusText.innerText = "Scanning Tech Feeds...";
        agentLog("<strong>Initiating live scan...</strong>");

        // STEP 1: PERCEPTION
        const response = await puter.net.fetch("https://news.ycombinator.com");
        const html = await response.text();
        agentLog("Data received. Processing with Gemini...");

        // STEP 2: REASONING
        statusText.innerText = "Gemini is thinking...";
        
        // Using the single-object parameter format to satisfy v2 requirements
        const aiResponse = await puter.ai.chat({
            model: 'gemini-3.1-flash-lite-preview',
            messages: [{
                role: 'user',
                content: `Identify ONE tech trend from this HTML. Return ONLY JSON: {"topic": "name", "summary": "1 sentence", "impact": 1-10} Content: ${html.substring(0, 3500)}`
            }]
        });

        const cleanJsonText = aiResponse.message.content.replace(/```json|```/g, '').trim();
        const knowledge = JSON.parse(cleanJsonText);
        
        agentLog(`Trend: <span style="color: #60a5fa;">${knowledge.topic}</span>`);

        // STEP 3: PERSISTENCE
        statusText.innerText = "Saving to Supabase...";
        const { error } = await _supabase
            .from('agent_knowledge')
            .insert([{ 
                topic: knowledge.topic, 
                content: knowledge.summary, 
                importance_score: knowledge.impact,
                source_url: "https://news.ycombinator.com"
            }]);

        if (error) throw error;

        agentLog("<span style='color: #22c55e;'>SUCCESS: Knowledge saved to cloud.</span>");
        statusText.innerText = "Idle - System Ready";
        pulse.className = 'idle';

    } catch (err) {
        agentLog(`<span style="color: #ef4444;">System Update: ${err.message}</span>`);
        statusText.innerText = "Idle";
        pulse.className = 'idle';
    }
}

// 4. EVENT LISTENERS
document.getElementById('start-btn').addEventListener('click', runLearningCycle);

autoBtn.addEventListener('click', () => {
    if (autoInterval) {
        clearInterval(autoInterval);
        autoInterval = null;
        autoBtn.innerText = "Toggle Autonomy: OFF";
        agentLog("Autonomy Disabled.");
    } else {
        autoInterval = setInterval(runLearningCycle, 900000); 
        autoBtn.innerText = "Toggle Autonomy: ON";
        agentLog("Autonomy Enabled.");
        runLearningCycle();
    }
});

agentLog("IS Agent v1.0 Initialized on GitHub Pages.");
