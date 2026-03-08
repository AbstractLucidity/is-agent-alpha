/**
 * IS_Agent_Alpha v2.0
 * Continuous Autonomy Logic
 */

// 1. CONFIGURATION
const SUPABASE_URL = 'https://essquahbhmpehemjsmbq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_SR1YSCO6Nshdr227My-NTg_crmO_t_t';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const logWindow = document.getElementById('log-window');
const statusBadge = document.getElementById('status-badge');
const autoBtn = document.getElementById('auto-btn');

let isAutoEnabled = false;

function agentLog(msg, color = "#94a3b8") {
    const time = new Date().toLocaleTimeString();
    logWindow.innerHTML += `<div style="margin-bottom:8px; color:${color}">[${time}] ${msg}</div>`;
    logWindow.scrollTop = logWindow.scrollHeight;
}

/**
 * CORE EXECUTION LOOP
 */
async function runCycle() {
    try {
        statusBadge.innerText = "WORKING";
        statusBadge.style.color = "#00a3ff";
        statusBadge.style.borderColor = "#00a3ff";

        // STEP 1: PERCEPTION (Scraping via AllOrigins)
        agentLog("Fetching data stream...", "#00a3ff");
        const target = "https://news.ycombinator.com";
        const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(target)}`;
        
        const resp = await fetch(proxy);
        const data = await resp.json();
        
        // Clean text to keep Gemini focused
        const cleanText = data.contents.replace(/<[^>]*>/g, ' ').substring(0, 2000);
        agentLog("Data normalized. Requesting analysis...");

        // STEP 2: REASONING (Puter v2 API)
        const aiResponse = await puter.ai.chat({
            model: 'gemini-3.1-flash-lite-preview',
            messages: [{
                role: 'user', 
                content: `Find ONE tech trend. Return ONLY JSON: {"topic": "name", "summary": "1 sentence", "impact": 10}. Text: ${cleanText}`
            }]
        });

        const content = aiResponse.text || aiResponse.message?.content;
        if (!content) throw new Error("AI returned empty data.");

        const insight = JSON.parse(content.replace(/```json|```/g, '').trim());
        agentLog(`Trend Identified: ${insight.topic}`, "#10b981");

        // STEP 3: PERSISTENCE (Supabase)
        const { error } = await _supabase.from('agent_knowledge').insert([{ 
            topic: insight.topic, 
            content: insight.summary, 
            importance_score: insight.impact,
            source_url: target
        }]);

        if (error) throw error;
        agentLog("Memory synced to cloud database.", "#10b981");

    } catch (err) {
        agentLog(`Error: ${err.message}`, "#ef4444");
    } finally {
        if (isAutoEnabled) {
            statusBadge.innerText = "COOLDOWN";
            statusBadge.style.color = "#94a3b8";
            agentLog("Continuous loop: Restarting in 30s...");
            setTimeout(runCycle, 30000); 
        } else {
            statusBadge.innerText = "IDLE";
            statusBadge.style.color = "#94a3b8";
            statusBadge.style.borderColor = "#334155";
        }
    }
}

// 4. EVENT HANDLERS
autoBtn.onclick = () => {
    isAutoEnabled = !isAutoEnabled;
    autoBtn.classList.toggle('on');
    autoBtn.innerText = isAutoEnabled ? "AUTONOMY: ACTIVE" : "TOGGLE CONTINUOUS AUTONOMY";
    
    if (isAutoEnabled) {
        agentLog("Autonomous sequence initiated.", "#10b981");
        runCycle();
    } else {
        agentLog("Autonomous sequence termination requested.", "#ef4444");
    }
};

document.getElementById('start-btn').onclick = () => {
    agentLog("Manual scan triggered.");
    runCycle();
};

window.onload = () => agentLog("IS_Agent_Alpha v2.0 Online. Standing by.");
