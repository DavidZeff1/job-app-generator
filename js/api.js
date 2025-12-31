const API = {
    // Cache for system prompt
    cachedSystemPrompt: null,
    
    async call(prompt, useCache = true) {
        const apiKey = Storage.getApiKey();
        if (!apiKey) throw new Error('No API key set.');
        
        // System prompt for caching (static content)
        const systemPrompt = `You are a professional resume writer. 
Output ONLY valid JSON. No markdown, no explanation, no backticks.
Be concise. Use action verbs. Match job keywords when asked.
For bold text, wrap in double asterisks: **keyword**`;
        
        const requestBody = {
            model: Config.API_MODEL,
            max_tokens: Config.MAX_TOKENS,
            system: useCache ? [
                {
                    type: "text",
                    text: systemPrompt,
                    cache_control: { type: "ephemeral" }
                }
            ] : systemPrompt,
            messages: [{ role: 'user', content: prompt }]
        };
        
        const response = await fetch(Config.API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': Config.API_VERSION,
                'anthropic-dangerous-direct-browser-access': 'true',
                'anthropic-beta': 'prompt-caching-2024-07-31'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error?.message || `API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Log cache performance
        if (data.usage) {
            console.log('Token usage:', {
                input: data.usage.input_tokens,
                output: data.usage.output_tokens,
                cache_read: data.usage.cache_read_input_tokens || 0,
                cache_creation: data.usage.cache_creation_input_tokens || 0
            });
        }
        
        return this.parseJSON(data.content[0].text);
    },
    
    parseJSON(text) {
        let str = text.trim();
        
        // Remove markdown code blocks if present
        if (str.startsWith('```json')) str = str.slice(7);
        else if (str.startsWith('```')) str = str.slice(3);
        if (str.endsWith('```')) str = str.slice(0, -3);
        
        // Find JSON object
        const start = str.indexOf('{');
        const end = str.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
            str = str.slice(start, end + 1);
        }
        
        return JSON.parse(str.trim());
    },
    
    async parseResume(text) {
        return this.call(Prompts.parseResume(text));
    },
    
    async generate(profile, job, options, type) {
        return this.call(Prompts.generateDocuments(profile, job, options, type));
    }
};
