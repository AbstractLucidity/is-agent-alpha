/**
 * IS_Agent_Alpha: Core Logic Layer (agent.js)
 * VERSION: v2 API Fixed & Stable
 */

// Initialize Supabase (Ensure your table 'agent_knowledge' has RLS policies allowing inserts if public)
const SUPABASE_URL = 'https://essquahbhmpehemjsmbq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_SR1YSCO6Nshdr227My-NTg_crmO_t_t';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const logWindow = document.getElementById('log-window');
const statusText = document.getElementById('status-text');
const pulse = document.getElementById('pulse');

function agentLog(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    let color = type === 'error' ? '#ef4444' : type === 'success' ? '#22c55e' : '#cbd5e1';
    logWindow.innerHTML += `<div><span style="color:#64748b">[${timestamp}]</span> <span style="color:${color}">${message}</span></div>`;
    logWindow.scrollTop = logWindow.scrollHeight; 
}

async function runLearningCycle() {
    try {
        statusText.innerText = "Perception: Scanning...";
        pulse.className = "active";
        
        // 1. PERCEPTION: Fetch & Clean
        agentLog("Bypassing CORS to fetch news.ycombinator.com...");
        const response = await puter.net.fetch("https://news.ycombinator.com");
        const html = await response.text();
        
        // Strip HTML tags and collapse whitespace to save tokens and prevent model confusion
        const cleanText = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").substring(0, 3000);
        agentLog("Data normalized. Initializing Reasoning Engine...");

        // 2. REASONING: Call Puter AI (FIXED SYNTAX)
        statusText.innerText = "Reasoning: Analyzing...";
        const prompt = `Task: You are an autonomous analyst. Identify ONE major tech trend from this scraped text. 
Output ONLY valid JSON in this exact format, with no markdown formatting or conversational text:
{"topic": "Name of trend", "summary": "One sentence summary", "impact": 8}

Scraped Data: ${cleanText}`;

        // Notice: Prompt is the 1st argument, Options object is the 2nd argument
        const aiResponse = await puter.ai.chat(prompt, { 
            model: 'gemini-2.5-flash-lite' // Updated to model supported in docs
        });

        // The v2 SDK returns a ChatResponse object with a message property
        const content = aiResponse?.message?.content || aiResponse?.text || aiResponse.toString();
        if (!content) throw new Error("AI returned an empty response.");

        // Robust parsing: Find the JSON block even if the AI adds filler text
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Failed to extract JSON from AI output.");
        
        const knowledge = JSON.parse(jsonMatch[0]);
        agentLog(`Intelligence Acquired: <b>${knowledge.topic}</b>`, 'success');

        // 3. PERSISTENCE: Save to Cloud
        statusText.innerText = "Persistence: Syncing...";
        const { error } = await supabaseClient
            .from('agent_knowledge')
            .insert([{ 
                topic: knowledge.topic, 
                content: knowledge.summary, 
                importance_score: knowledge.impact
            }]);

        if (error) throw error;

        agentLog(`Memory committed to Supabase successfully.`, 'success');
        statusText.innerText = "Idle";
        pulse.className = "idle";

    } catch (err) {
        console.error("Agent Critical Failure:", err);
        agentLog(`Error: ${err.message}`, 'error');
        statusText.innerText = "System Error";
        pulse.className = "idle";
    }
}

document.getElementById('start-btn').addEventListener('click', runLearningCycle);
agentLog("IS Agent v2.0 Online. Standing by.");
