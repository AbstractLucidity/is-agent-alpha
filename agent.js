/**
 * IS_Agent_Alpha v2.0 - Continuous Autonomy
 */
const SUPABASE_URL = 'https://essquahbhmpehemjsmbq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_SR1YSCO6Nshdr227My-NTg_crmO_t_t';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const logWindow = document.getElementById('log-window');
const statusText = document.getElementById('status-text');
const autoBtn = document.getElementById('auto-btn');

let isAuto = false;

function agentLog(msg, color = "#94a3b8") {
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
    logWindow.innerHTML += `<div style="margin-bottom:8px; color:${color}">[${time}] ${msg}</div>`;
    logWindow.scrollTop = logWindow.scrollHeight;
}

async function startCycle() {
    if (!isAuto && event?.type !== 'click') return; // Stop if not auto or a manual click
    
    try {
        statusText.innerText = "WORKING";
        agentLog("Bypassing CORS to fetch data...", "#00a3ff");

        const resp = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent("https://news.ycombinator.com")}`);
        const data = await resp.json();
        const text = data.contents.replace(/<[^>]*>/g, ' ').substring(0, 2000);

        agentLog("Data normalized. Reasoning starting...");
        
        const ai = await puter.ai.chat({
            model: 'gemini-3.1-flash-lite-preview',
            messages: [{role: 'user', content: `Extract ONE trend as JSON: {"topic": "name", "summary": "1 sentence", "impact": 10}. Data: ${text}`}]
        });

        const res = JSON.parse((ai.text || ai.message.content).replace(/```json|```/g, ''));
        agentLog(`Insight: ${res.topic}`, "#10b981");

        await _supabase.from('agent_knowledge').insert([{ 
            topic: res.topic, content: res.summary, importance_score: res.impact 
        }]);

        agentLog("Memory committed to Supabase.", "#10b981");

    } catch (e) {
        agentLog(`Error: ${e.message}`, "#ef4444");
    } finally {
        if (isAuto) {
            statusText.innerText = "COOLDOWN";
            agentLog("Restarting cycle in 30s...", "#64748b");
            setTimeout(startCycle, 30000); // 30 second continuous loop
        } else {
            statusText.innerText = "IDLE";
        }
    }
}

autoBtn.onclick = () => {
    isAuto = !isAuto;
    autoBtn.classList.toggle('on');
    autoBtn.innerText = isAuto ? "AUTONOMY: ACTIVE" : "AUTONOMY: DISABLED";
    
    if (isAuto) {
        agentLog("Continuous Autonomy Engaged.", "#10b981");
        startCycle();
    } else {
        agentLog("Sequence Termination Requested.", "#ef4444");
    }
};

document.getElementById('start-btn').onclick = startCycle;
window.onload = () => agentLog("IS_Agent_Alpha Online. Ready for instructions.");
