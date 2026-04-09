/**
 * OpenRouter AI Service for BaZi Consultant
 * Uses DeepSeek model via OpenRouter API
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

class OpenRouterService {
    constructor() {
        this.apiKey = process.env.OPENROUTER_API_KEY;
        this.model = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat';
        this.maxRetries = 3;
        this.timeout = 60000; // 60 seconds timeout
        this.maxTokens = {
            ask: parseInt(process.env.OPENROUTER_MAX_TOKENS_ASK || '1400', 10),
            comprehensive: parseInt(process.env.OPENROUTER_MAX_TOKENS_COMPREHENSIVE || '2000', 10),
            que: parseInt(process.env.OPENROUTER_MAX_TOKENS_QUE || '1400', 10),
            matching: parseInt(process.env.OPENROUTER_MAX_TOKENS_MATCHING || '1500', 10)
        };
    }

    estimateTokens(text = '') {
        if (!text || typeof text !== 'string') return 0;
        return Math.ceil(text.length / 4);
    }

    logUsage(endpoint, startedAt, messages, usage = {}) {
        const promptChars = messages.reduce((sum, m) => sum + (m.content?.length || 0), 0);
        const approxPromptTokens = this.estimateTokens(messages.map(m => m.content || '').join('\n'));
        const durationMs = Date.now() - startedAt;
        console.log(
            `[OpenRouter/Metrics] endpoint=${endpoint} duration_ms=${durationMs} prompt_chars=${promptChars}` +
            ` approx_prompt_tokens=${approxPromptTokens} prompt_tokens=${usage.prompt_tokens || 0}` +
            ` completion_tokens=${usage.completion_tokens || 0} total_tokens=${usage.total_tokens || 0}`
        );
    }

    /**
     * Generate AI response for a BaZi question with retry logic
     * @param {Object} baziContext - Full BaZi analysis context
     * @param {Object} luckCyclesData - Đại Vận và Lưu Niên data
     * @param {string} questionText - The question user selected
     * @param {string} personaId - ID of the consultant persona
     * @param {Object} partnerContext - Optional Bazi context for partner
     * @returns {Promise<Object>} Object containing answer paragraphs and follow-up questions
     */
    async generateAnswer(baziContext, luckCyclesData, questionText, personaId = 'huyen_co', partnerContext = null) {
        if (!this.apiKey) {
            throw new Error('OPENROUTER_API_KEY is not configured');
        }

        const systemPrompt = this.buildSystemPrompt(personaId);
        const userPrompt = this.buildUserPrompt(baziContext, luckCyclesData, questionText, personaId, partnerContext);

        const startedAt = Date.now();
        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ];
        let lastError;
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                console.log(`[OpenRouter] Attempt ${attempt}/${this.maxRetries}...`);

                // Create AbortController for timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);

                const response = await fetch(OPENROUTER_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`,
                        'HTTP-Referer': 'https://vietlac.com',
                        'X-Title': 'BaZi Consultant'
                    },
                    body: JSON.stringify({
                        model: this.model,
                        messages,
                        max_tokens: this.maxTokens.ask,
                        temperature: 0.7
                    }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
                }

                const data = await response.json();
                const content = data.choices?.[0]?.message?.content || '';

                if (!content || content.trim().length < 10) {
                    throw new Error('Empty or too short response from AI');
                }

                console.log(`[OpenRouter] Success on attempt ${attempt}`);
                this.logUsage('consultant.ask', startedAt, messages, data.usage);
                // Split response into paragraphs for frontend display
                const formatted = this.formatResponse(content);
                
                // If format failed to find follow-ups, maybe try again? 
                // Only if it's really short or looks wrong
                if (formatted.answer.length === 1 && formatted.answer[0].includes('Xin lỗi') && attempt < this.maxRetries) {
                   throw new Error('Interpretation malformed or rejected by AI');
                }

                return formatted;
            } catch (error) {
                lastError = error;
                console.error(`[OpenRouter] Attempt ${attempt} failed:`, error.message);

                // Check if it's a retryable error
                const isRetryable = this.isRetryableError(error);

                if (!isRetryable || attempt === this.maxRetries) {
                    break;
                }

                // Wait before retry (exponential backoff)
                const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                console.log(`[OpenRouter] Waiting ${waitTime}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }

        console.error('[OpenRouter] All attempts failed:', lastError);
        // Return fallback response instead of throwing
        return this.getFallbackResponse(questionText);
    }

    /**
     * Check if error is retryable (network issues, timeouts, etc.)
     */
    isRetryableError(error) {
        const message = error.message?.toLowerCase() || '';
        return (
            error.name === 'AbortError' || // Timeout
            message.includes('terminated') ||
            message.includes('socket') ||
            message.includes('network') ||
            message.includes('econnreset') ||
            message.includes('econnrefused') ||
            message.includes('etimedout') ||
            message.includes('fetch failed') ||
            message.includes('other side closed') ||
            message.includes('empty') || // Custom empty response error
            message.includes('too short') ||
            message.includes('invalid json') || // JSON parsing errors
            message.includes('malformed') ||
            message.includes('rejected')
        );
    }

    /**
     * Fallback response when service is unavailable - with Thầy persona
     */
    getFallbackResponse(questionText) {
        return {
            answer: [
                `Con ơi, Thầy đang gặp chút trở ngại trong việc kết nối nguồn năng lượng để luận giải câu hỏi "${questionText}" của con.`,
                'Con hãy kiên nhẫn chờ ít phút rồi thử lại nhé. Duyên đến thì mọi sự sẽ sáng tỏ.',
                'Thầy xin lỗi vì sự bất tiện này. Linh thạch của con sẽ được hoàn lại nếu Thầy không thể trả lời được.'
            ],
            followUps: [
                "Con có muốn thầy xem kỹ hơn về đường tài lộc trong năm tới không?",
                "Vấn đề tình cảm của con có gì cần thầy gỡ rối thêm không?",
                "Con có muốn biết mình hợp với ngành nghề nào để phát tài nhanh nhất không?"
            ]
        };
    }

    /**
     * Build system prompt for BaZi consultant persona
     */
    buildSystemPrompt(personaId) {
        const personas = {
            'huyen_co': `Bạn là Thầy Quảng, chuyên gia Bát Tự/Tứ Trụ phong cách uyên bác, rõ ràng, nhân văn.
- Xưng "Thầy", gọi người hỏi là "con" hoặc "mệnh chủ".
- Luận giải dựa trên dữ liệu lá số được cung cấp, tránh chung chung.`,

            'menh_meo': `Bạn là Tù trưởng Bường A Lỏ, chuyên gia Bát Tự phong cách GenZ dí dỏm nhưng vẫn đúng chuyên môn.
- Xưng "Thầy", gọi người hỏi là "con" hoặc "mệnh chủ".
- Có thể dùng ít slang/emoji vừa phải, không lạm dụng.`
        };

        const basePrompt = personas[personaId] || personas['huyen_co'];

        return `${basePrompt}

QUY TẮC TRẢ LỜI:
1. Mở đầu ngắn, sau đó phân tích 3-4 ý chính, mỗi ý 2-3 câu.
2. Không nhắc đến AI, prompt hay hệ thống.
3. Kết thúc bằng mục [FOLLOW_UP] gồm 3-4 câu hỏi, mỗi dòng bắt đầu bằng "-".`;
    }

    /**
     * Build user prompt with BaZi context
     */
    buildUserPrompt(baziContext, luckCyclesData, questionText, personaId, partnerContext = null) {
        // Get current date/time
        const now = new Date();
        const currentDateTime = now.toLocaleString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            weekday: 'long'
        });

        // Extract key information
        const basicInfo = baziContext.thong_tin_co_ban || {};
        const pillars = baziContext.chi_tiet_tru || [];
        const analysis = baziContext.phan_tich || {};

        // Compact pillars summary
        const pillarsLabels = ['Năm', 'Tháng', 'Ngày', 'Giờ'];
        const pillarsSimple = pillars.map((p, i) => {
            return `${pillarsLabels[i]}: ${p.can || 'N/A'} ${p.chi || 'N/A'}`;
        }).join(' | ');

        // Format current luck cycle
        let luckInfo = '';
        const currentYear = now.getFullYear();
        if (luckCyclesData?.dai_van && luckCyclesData.dai_van.length > 0) {
            const currentDaiVan = luckCyclesData.dai_van.find(dv => {
                const endYear = dv.nam + 9;
                return currentYear >= dv.nam && currentYear <= endYear;
            });
            if (currentDaiVan) {
                luckInfo = `
- Đại Vận hiện tại: ${currentDaiVan.can_chi} (${currentDaiVan.nam} - ${currentDaiVan.nam + 9})
- Thập Thần Đại Vận: ${currentDaiVan.thap_than}
- Năm hiện tại (Lưu Niên): ${currentYear}`;
            }
        }

        // Format Dụng Thần / Kỵ Thần
        let godInfo = '';
        if (analysis.can_bang_ngu_hanh) {
            const cb = analysis.can_bang_ngu_hanh;
            godInfo = `
- Dụng Thần: ${cb.dung_than?.ngu_hanh?.join(', ') || 'Chưa xác định'}
- Hỷ Thần: ${cb.hy_than?.ngu_hanh?.join(', ') || 'Chưa xác định'}
- Kỵ Thần: ${cb.ky_than?.ngu_hanh?.join(', ') || 'Chưa xác định'}
- Cường độ Nhật Chủ: ${cb.nhan_dinh?.cuong_do || 'Chưa xác định'}`;
        }

        const relationshipHint = /(hôn nhân|tình|yêu|vợ|chồng|người yêu|đối phương|cặp đôi|duyên|kết hợp)/i;
        const shouldIncludePartner = partnerContext && relationshipHint.test(String(questionText || ''));

        return `
## THỜI GIAN HIỆN TẠI
${currentDateTime}
(Năm ${currentYear})

${shouldIncludePartner ? `
## THÔNG TIN NGƯỜI PHỐI HỢP/ĐỐI PHƯƠNG
- Tên: ${partnerContext.name || 'Đối phương'}
- Giới tính: ${partnerContext.isFemale ? 'Nữ' : 'Nam'}
- Bát Tự: ${partnerContext.gans[0]} ${partnerContext.zhis[0]} (Năm) | ${partnerContext.gans[1]} ${partnerContext.zhis[1]} (Tháng) | ${partnerContext.gans[2]} ${partnerContext.zhis[2]} (Ngày) | ${partnerContext.gans[3]} ${partnerContext.zhis[3]} (Giờ)
- Nhật Chủ: ${partnerContext.gans[2]} (${partnerContext.elements?.[partnerContext.gans[2]] || ''})
- Thập Thần: ${partnerContext.ganShens?.join(', ')}
- Nạp Âm: ${partnerContext.nayin?.join(', ')}
- Vòng Trường Sinh: ${partnerContext.pillarStages?.join(', ')}
` : ''}

---

## THÔNG TIN LÁ SỐ BÁT TỰ

**Thông tin cơ bản:**
- Tên: ${basicInfo.ten || 'Mệnh chủ'}
- Giới tính: ${basicInfo.gioi_tinh || 'Nam'}
- Ngày sinh dương lịch: ${basicInfo.ngay_sinh_duong || 'N/A'}
- Ngày sinh âm lịch: ${basicInfo.ngay_sinh_am || 'N/A'}
- Giờ sinh: ${basicInfo.gio_sinh || 'N/A'}
- Mệnh (Ngũ Hành Nạp Âm): ${basicInfo.menh || 'N/A'}
- Cung Mệnh: ${basicInfo.menh_cung || 'N/A'}

**Bát Tự (Tứ Trụ) tóm tắt:**
${pillarsSimple}

**Phân tích Cách Cục:**
${godInfo}

**Vận hạn hiện tại:**
${luckInfo}

---

## CÂU HỎI CỦA NGƯỜI DÙNG
 
 "${questionText}"
 
 ---
 
 Hãy trả lời dựa trên lá số đã cho, đi thẳng vào trọng tâm câu hỏi.
 
 YÊU CẦU QUAN TRỌNG:
 1. Trả lời bằng phong cách của nhân vật ${personaId === 'menh_meo' ? 'Tù trưởng Bường A Lỏ' : 'Thầy Quảng'}.
 2. Đưa ra 3-4 đoạn súc tích, có luận điểm rõ.
 3. Kết thúc với [FOLLOW_UP] gồm 3-4 câu hỏi gợi mở liên quan trực tiếp lá số và vận hiện tại.`;
    }

    /**
     * Format AI response into paragraphs and follow-up questions
     */
    formatResponse(content) {
        if (!content) return { answer: ['Xin lỗi, thầy đang bận chút việc...'], followUps: [] };

        let answerText = content;
        let followUps = [];

        // Extract follow-up questions
        const followUpMatch = content.match(/\[FOLLOW_UP\]([\s\S]*)$/i);
        if (followUpMatch) {
            answerText = content.split(/\[FOLLOW_UP\]/i)[0].trim();
            const followUpContent = followUpMatch[1].trim();
            followUps = followUpContent
                .split('\n')
                .map(line => line.replace(/^[\-\*•\s\d\.]+/, '').trim())
                .filter(line => line.length > 5 && line.endsWith('?'));
        }

        // Clean up trailing markdown artifacts like **, ##, -- from answerText
        answerText = answerText.replace(/[\s\*\-\_\#\=\+]+$/, '').trim();

        // Split answer into paragraphs
        const paragraphs = answerText
            .split(/\n\n+/)
            .map(p => p.trim())
            .filter(p => p.length > 0);

        return {
            answer: paragraphs.length > 0 ? paragraphs : [answerText],
            followUps: followUps.length > 0 ? followUps : [
                "Con có muốn thầy xem kỹ hơn về đường tài lộc trong năm tới không?",
                "Vấn đề tình cảm của con có gì cần thầy gỡ rối thêm không?",
                "Con có muốn biết mình hợp với ngành nghề nào để phát tài nhanh nhất không?"
            ]
        };
    }

    /**
     * Generate simple completion for comprehensive interpretation
     * @param {string} prompt - The full prompt to send
     * @param {string} personaId - Persona for fallback purposes
     * @returns {Promise<string>} The AI generated text
     */
    async generateCompletion(prompt, personaId = 'huyen_co', options = {}) {
        if (!this.apiKey) {
            throw new Error('OPENROUTER_API_KEY is not configured');
        }

        const endpoint = options.endpoint || 'completion';
        const maxTokens = options.maxTokens || this.maxTokens.comprehensive;
        const startedAt = Date.now();
        const messages = [{ role: 'user', content: prompt }];
        let lastError;
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                console.log(`[OpenRouter/Completion] Attempt ${attempt}/${this.maxRetries}...`);

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);

                const response = await fetch(OPENROUTER_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`,
                        'HTTP-Referer': 'https://vietlac.com',
                        'X-Title': 'BaZi Comprehensive'
                    },
                    body: JSON.stringify({
                        model: this.model,
                        messages,
                        max_tokens: maxTokens,
                        temperature: 0.75
                    }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
                }

                const data = await response.json();
                const content = data.choices?.[0]?.message?.content;

                if (!content) {
                    throw new Error('Empty response from AI');
                }

                console.log(`[OpenRouter/Completion] Success on attempt ${attempt}`);
                this.logUsage(endpoint, startedAt, messages, data.usage);
                let finalContent = content.trim();

                // Remove markdown code block wrappers if they exist
                if (finalContent.startsWith('```')) {
                    const lines = finalContent.split('\n');
                    if (lines[0].startsWith('```')) lines.shift(); // Remove starting ```markdown or ```
                    if (lines[lines.length - 1].startsWith('```')) lines.pop(); // Remove ending ```
                    finalContent = lines.join('\n').trim();
                }

                return finalContent;

            } catch (error) {
                lastError = error;
                console.error(`[OpenRouter/Completion] Attempt ${attempt} failed:`, error.message);

                if (attempt < this.maxRetries && this.isRetryableError(error)) {
                    const delay = Math.pow(2, attempt) * 1000;
                    console.log(`[OpenRouter/Completion] Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        console.error('[OpenRouter/Completion] All attempts failed, returning fallback');
        return this.getComprehensiveFallback(personaId);
    }

    /**
     * Generate AI response for a BaZi matching (compatibility) analysis
     * @param {Object} person1Ctx - BaZi context for person 1
     * @param {Object} person2Ctx - BaZi context for person 2
     * @param {string} relationshipType - Type of relationship
     * @param {string} personaId - ID of the consultant persona
     * @returns {Promise<Object>} Object matching the standard matching UI structure
     */
    async generateMatchingAnswer(person1Ctx, person2Ctx, relationshipType = 'romance', personaId = 'huyen_co') {
        if (!this.apiKey) {
            throw new Error('OPENROUTER_API_KEY is not configured');
        }

        const systemPrompt = `Bạn là chuyên gia Bát Tự. Phân tích tương hợp sâu, nêu rõ cơ hội/rủi ro thực tế, tránh chung chung.
Trả về DUY NHẤT JSON hợp lệ (không markdown, không text ngoài JSON).
Schema:
{
  "totalScore": 0-100,
  "assessment": { "level":"excellent|good|neutral|challenging|difficult", "title":"string", "summary":"string", "icon":"emoji" },
  "breakdown": {
    "element": { "score":0-30, "maxScore":30, "description":"string", "quality":"excellent|good|neutral|challenging|difficult" },
    "ganzhi": { "score":0-25, "maxScore":25, "details":[{"type":"positive|negative","text":"string"}], "quality":"excellent|good|neutral|challenging|difficult" },
    "shishen": { "score":0-25, "maxScore":25, "details":[{"type":"positive|negative","text":"string"}], "quality":"excellent|good|neutral|challenging|difficult" },
    "star": { "score":0-20, "maxScore":20, "details":[{"type":"positive|negative","text":"string"}], "quality":"excellent|good|neutral|challenging|difficult" }
  },
  "aspects": [{"type":"romance|communication|children|finance|lifestyle","icon":"emoji","title":"string","score":0-100,"description":"string"}],
  "advice": [{"type":"positive|neutral|warning|tip","text":"string"}],
  "suggestedQuestions": ["string","string","string"]
}`;

        const now = new Date();
        const currentDateTime = now.toLocaleString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            weekday: 'long'
        });

        // Current Luck Cycle calculation
        const { getCurrentDaiVan } = require('../bazi/dayun');
        const currentYear = now.getFullYear();
        const age1 = currentYear - person1Ctx.solar.getYear() + 1;
        const age2 = currentYear - person2Ctx.solar.getYear() + 1;

        const dv1 = getCurrentDaiVan(person1Ctx.dai_van || [], age1);
        const dv2 = getCurrentDaiVan(person2Ctx.dai_van || [], age2);

        const relMapping = {
            'romance': 'Tình duyên / Hôn nhân',
            'friendship': 'Bạn bè',
            'parent_child': 'Cha mẹ - Con cái',
            'siblings': 'Anh chị em',
            'business': 'Đối tác kinh doanh',
            'colleague': 'Đồng nghiệp',
            'teacher_student': 'Thầy trò',
            'spiritual': 'Đạo hữu / Tâm linh',
            'rival': 'Đối thủ / Cạnh tranh',
            'boss_employee': 'Cấp trên - Cấp dưới'
        };
        const relationshipVN = relMapping[relationshipType] || relationshipType;

        const userPrompt = `Phân tích tương hợp mối quan hệ "${relationshipVN}" của hai người sau, tập trung xung đột cụ thể và cách hóa giải:
        
        THỜI ĐIỂM XEM (Hiện tại): ${currentDateTime}
        
        NGƯỜI 1 (Nam/Nữ: ${person1Ctx.isFemale ? 'Nữ' : 'Nam'}):
        - Bát Tự: ${person1Ctx.gans[0]} ${person1Ctx.zhis[0]} (Năm) | ${person1Ctx.gans[1]} ${person1Ctx.zhis[1]} (Tháng) | ${person1Ctx.gans[2]} ${person1Ctx.zhis[2]} (Ngày) | ${person1Ctx.gans[3]} ${person1Ctx.zhis[3]} (Giờ)
        - Nhật Chủ: ${person1Ctx.gans[2]} (Hành: ${person1Ctx.elements?.[person1Ctx.gans[2]] || ''})
        - Thập Thần: ${person1Ctx.ganShens?.join(', ')}
        - Nạp Âm: ${person1Ctx.nayin?.join(', ')}
        - Vòng Trường Sinh: ${person1Ctx.pillarStages?.join(', ')}
        - Ngũ Hành: Kim: ${person1Ctx.elements?.Kim || 0}, Mộc: ${person1Ctx.elements?.Moc || 0}, Thủy: ${person1Ctx.elements?.Thuy || 0}, Hỏa: ${person1Ctx.elements?.Hoa || 0}, Thổ: ${person1Ctx.elements?.Tho || 0}
        - Đại Vận hiện tại: ${dv1 ? `${dv1.can_chi} (${dv1.thap_than}) - ${dv1.luan_giai?.split('\n')[1] || ''}` : 'N/A'}
        
        NGƯỜI 2 (Nam/Nữ: ${person2Ctx.isFemale ? 'Nữ' : 'Nam'}):
        - Bát Tự: ${person2Ctx.gans[0]} ${person2Ctx.zhis[0]} (Năm) | ${person2Ctx.gans[1]} ${person2Ctx.zhis[1]} (Tháng) | ${person2Ctx.gans[2]} ${person2Ctx.zhis[2]} (Ngày) | ${person2Ctx.gans[3]} ${person2Ctx.zhis[3]} (Giờ)
        - Nhật Chủ: ${person2Ctx.gans[2]} (Hành: ${person2Ctx.elements?.[person2Ctx.gans[2]] || ''})
        - Thập Thần: ${person2Ctx.ganShens?.join(', ')}
        - Nạp Âm: ${person2Ctx.nayin?.join(', ')}
        - Vòng Trường Sinh: ${person2Ctx.pillarStages?.join(', ')}
        - Ngũ Hành: Kim: ${person2Ctx.elements?.Kim || 0}, Mộc: ${person2Ctx.elements?.Moc || 0}, Thủy: ${person2Ctx.elements?.Thuy || 0}, Hỏa: ${person2Ctx.elements?.Hoa || 0}, Thổ: ${person2Ctx.elements?.Tho || 0}
        - Đại Vận hiện tại: ${dv2 ? `${dv2.can_chi} (${dv2.thap_than}) - ${dv2.luan_giai?.split('\n')[1] || ''}` : 'N/A'}
        
        Yêu cầu: Luận giải sắc nét, dùng thuật ngữ Bát Tự đúng ngữ cảnh, trả về JSON theo schema đã cho.`;

        const startedAt = Date.now();
        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ];
        let lastError;
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                console.log(`[OpenRouter/Matching] Attempt ${attempt}/${this.maxRetries}...`);
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);

                const response = await fetch(OPENROUTER_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`,
                        'HTTP-Referer': 'https://vietlac.com',
                        'X-Title': 'BaZi Matching'
                    },
                    body: JSON.stringify({
                        model: this.model,
                        messages,
                        response_format: { type: "json_object" },
                        max_tokens: this.maxTokens.matching,
                        temperature: 0.7
                    }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
                }

                const data = await response.json();
                const content = data.choices?.[0]?.message?.content;

                if (!content) throw new Error('Empty response from AI');

                // Use cleanAndParseJSON with validation
                const parsedResult = this.cleanAndParseJSON(content);
                console.log(`[OpenRouter/Matching] Success on attempt ${attempt}`);
                this.logUsage('matching.ai', startedAt, messages, data.usage);
                return parsedResult;

            } catch (error) {
                lastError = error;
                console.error(`[OpenRouter/Matching] Attempt ${attempt} failed:`, error.message);

                if (attempt < this.maxRetries && this.isRetryableError(error)) {
                    const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                    console.log(`[OpenRouter/Matching] Waiting ${waitTime}ms before retry...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                } else {
                    break;
                }
            }
        }

        console.error('[OpenRouter/Matching] All attempts failed, returning fallback');
        // Return a valid fallback structure instead of throwing
        return {
            totalScore: 50,
            assessment: {
                level: 'neutral',
                title: 'Cần phân tích thêm',
                summary: 'Thầy đang gặp chút khó khăn trong việc phân tích chi tiết. Vui lòng thử lại hoặc liên hệ hỗ trợ.',
                icon: '🔮'
            },
            breakdown: {
                element: { score: 15, maxScore: 30, description: 'Chưa phân tích được chi tiết', quality: 'neutral' },
                ganzhi: { score: 12, maxScore: 25, details: [], quality: 'neutral' },
                shishen: { score: 12, maxScore: 25, details: [], quality: 'neutral' },
                star: { score: 10, maxScore: 20, details: [], quality: 'neutral' }
            },
            aspects: [
                { type: 'romance', icon: '💕', title: 'Tình Cảm', score: 50, description: 'Cần xem xét thêm' },
                { type: 'communication', icon: '💬', title: 'Giao Tiếp', score: 50, description: 'Cần xem xét thêm' },
                { type: 'finance', icon: '💰', title: 'Tài Chính', score: 50, description: 'Cần xem xét thêm' }
            ],
            advice: [
                { type: 'neutral', text: 'Hãy kiên nhẫn và thử lại sau. Thầy sẽ cố gắng phân tích kỹ hơn cho con.' }
            ],
            suggestedQuestions: [
                "Làm sao để cải thiện mối quan hệ này?",
                "Có điều gì cần lưu ý trong thời gian tới?",
                "Làm thế nào để hóa giải những xung khắc?"
            ]
        };
    }

    /**
     * Clean and parse JSON response from LLM
     * Handles markdown code blocks and validates structure
     * @param {string} content - Raw content from LLM
     * @returns {Object} Parsed and validated JSON object
     * @throws {Error} If JSON is invalid or missing required fields
     */
    cleanAndParseJSON(content) {
        if (!content || typeof content !== 'string') {
            throw new Error('Empty or invalid content');
        }

        // Remove markdown code blocks (```json ... ``` or ``` ... ```)
        let cleaned = content.trim();
        
        // More robust markdown block extraction
        const codeBlockMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
        if (codeBlockMatch) {
            cleaned = codeBlockMatch[1].trim();
            console.log('[JSON Cleaner] Extracted content from markdown code block');
        }

        // If it still looks like it has a preamble (e.g. "Here is the JSON: { ... }"), try to find the actual JSON start
        if (!cleaned.startsWith('{') && cleaned.includes('{')) {
            const firstBrace = cleaned.indexOf('{');
            const lastBrace = cleaned.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                cleaned = cleaned.substring(firstBrace, lastBrace + 1);
                console.log('[JSON Cleaner] Extracted content between first and last curly braces');
            }
        }

        // Try to parse JSON
        let parsed;
        try {
            parsed = JSON.parse(cleaned);
        } catch (parseError) {
            console.error('[JSON Parse Error]', parseError.message);
            // Log a bit more for debugging
            console.error('[Cleaned Content Preview]', cleaned.substring(0, 200));
            throw new Error(`Invalid JSON from LLM: ${parseError.message}`);
        }

        // Validate required fields for matching response
        if (parsed.totalScore === undefined && parsed.totalScore !== 0) {
            console.warn('[JSON Validation] Missing totalScore, using default');
            parsed.totalScore = 50;
        }

        if (!parsed.assessment) {
            console.warn('[JSON Validation] Missing assessment, using default');
            parsed.assessment = {
                level: 'neutral',
                title: 'Cần xem xét thêm',
                summary: 'Thông tin chưa đầy đủ để đánh giá.',
                icon: '🔮'
            };
        }

        if (!parsed.breakdown) {
            console.warn('[JSON Validation] Missing breakdown, using default');
            parsed.breakdown = {};
        }

        if (!Array.isArray(parsed.aspects)) {
            console.warn('[JSON Validation] Missing or invalid aspects, using default');
            parsed.aspects = [];
        }

        if (!Array.isArray(parsed.advice)) {
            console.warn('[JSON Validation] Missing or invalid advice, using default');
            parsed.advice = [];
        }

        if (!Array.isArray(parsed.suggestedQuestions)) {
            console.warn('[JSON Validation] Missing or invalid suggestedQuestions, using default');
            parsed.suggestedQuestions = [
                "Làm sao để cải thiện mối quan hệ này?",
                "Có điều gì cần lưu ý trong thời gian tới?",
                "Làm thế nào để hóa giải những xung khắc?"
            ];
        }

        console.log('[JSON Validation] Successfully validated matching response');
        return parsed;
    }

    /**
     * Fallback for comprehensive interpretation
     */
    getComprehensiveFallback(personaId) {
        if (personaId === 'menh_meo') {
            return `🐱 Ối dồi ôi, server đang bận lắm nè con ơi!

Thầy Mèo đang chill một chút, con thử lại sau nha! 😸

Nhưng nhìn sơ qua lá số thì Thầy thấy con cũng vibe lắm đó, năng lượng dồi dào, tiềm năng phát triển cực mạnh. Chờ tí Thầy comeback là Thầy sẽ flex cho con một bản luận giải đỉnh của chóp!

✨ Tips nhanh: Hãy tin vào bản thân và đừng ngại thử thách mới nhé con!`;
        }

        return `Kính thưa Mệnh chủ,

Hệ thống đang gặp một chút trở ngại trong việc kết nối với nguồn tri thức. Xin Mệnh chủ vui lòng thử lại sau ít phút.

Tuy nhiên, dựa trên những gì Thầy đã nhìn thấy từ Tứ Trụ của con, đây là một lá số có nhiều tiềm năng phát triển. Ngũ hành trong mệnh cách khá cân bằng, cho thấy con có khả năng thích ứng tốt với môi trường.

Xin con hãy kiên nhẫn, Thầy sẽ sớm có bản luận giải đầy đủ cho con.

Thầy Huyền Cơ kính bút.`;
    }
}

module.exports = new OpenRouterService();
