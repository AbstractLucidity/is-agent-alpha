/**
 * IS_Agent_Alpha: Core Logic Layer (agent.js)
 * VERSION: Bulletproof DOM & API Fix
 */

const SUPABASE_URL = 'https://essquahbhmpehemjsmbq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_SR1YSCO6Nshdr227My-NTg_crmO_t_t';
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// Safe logging function
function agentLog(message, type = 'info') {
    const logWindow = document.getElementById('log-window');
    if (!logWindow) return; // Failsafe if HTML is missing
    
    const timestamp = new Date().toLocaleTimeString();
    let color = type === 'error' ? '#ef4444' : type === 'success' ? '#22c55e' : '#cbd5e1';
    logWindow.innerHTML += `<div style="margin-bottom: 8px;"><span style="color:#64748b">[${timestamp}]</span> <span style="color:${color}">${message}</span></div>`;
    logWindow.scrollTop = logWindow.scrollHeight; 
}

// Safe UI update function
function setAgentState(statusTextMsg, isScanning) {
    const statusText = document.getElementById('status-text');
    const pulse = document.getElementById('pulse');
    
    if (statusText) statusText.innerText = statusTextMsg;
    
    if (pulse) {
        if (isScanning) {
            pulse.classList.add('active');
        } else {
            pulse.classList.remove('active');
        }
    }
}

async function runLearningCycle() {
    try {
        setAgentState("Perception: Scanning...", true);
        
        // 1. PERCEPTION
        agentLog("Bypassing CORS to fetch news.ycombinator.com...");
        const response = await puter.net.fetch("https://news.ycombinator.com");
        const html = await response.text();
        
        const cleanText = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").substring(0, 3000);
        agentLog("Data normalized. Initializing Reasoning Engine...");

        // 2. REASONING
        setAgentState("Reasoning: Analyzing...", true);
        const prompt = `Task: You are an autonomous analyst. Identify ONE major tech trend from this scraped text. 
Output ONLY valid JSON in this exact format, with no markdown formatting or conversational text:
{"topic": "Name of trend", "summary": "One sentence summary", "impact": 8}

Scraped Data: ${cleanText}`;

        const aiResponse = await puter.ai.chat(prompt, { 
            model: 'gemini-2.5-flash-lite' 
        });

        const content = aiResponse?.message?.content || aiResponse?.text || aiResponse.toString();
        if (!content) throw new Error("AI returned an empty response.");

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Failed to extract JSON from AI output.");
        
        const knowledge = JSON.parse(jsonMatch[0]);
        agentLog(`Intelligence Acquired: <b>${knowledge.topic}</b>`, 'success');

        // 3. PERSISTENCE
        setAgentState("Persistence: Syncing...", true);
        
        if (!supabaseClient) throw new Error("Supabase is not initialized.");
        
        const { error } = await supabaseClient
            .from('agent_knowledge')
            .insert([{ 
                topic: knowledge.topic, 
                content: knowledge.summary, 
                importance_score: knowledge.impact
            }]);

        if (error) throw error;

        agentLog(`Memory committed to Supabase successfully.`, 'success');
        setAgentState("Idle", false);

    } catch (err) {
        console.error("Agent Critical Failure:", err);
        agentLog(`Error: ${err.message}`, 'error');
        setAgentState("System Error", false);
    }
}

// Ensure the button actually exists before adding a click listener
document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', runLearningCycle);
        agentLog("IS Agent v2.0 Online. Standing by.");
    } else {
        console.error("Could not find start-btn in HTML!");
    }
});
