// ============================================================
//  TTS 设置 — 默认值（与后端约定保持一致）
// ============================================================
const TTS_DEFAULTS = {
    prompt_language: "中文",
    text_language:   "中文",
    top_k:           "15",
    top_p:           "1",
    temperature:     "0.8",
    speed:           "0.9",
    sample_steps:    "32",
    if_sr:           "false"
}

// 当前生效的设置（运行时内存中）
let ttsSettings = { ...TTS_DEFAULTS }

// ============================================================
//  LLM 模型设置 — 默认值
// ============================================================
const LLM_DEFAULTS = {
    llm_model:       "deepseek-v4-pro",
    thinking:        "enabled",
    reasoning_effort: "high"
}

// 当前生效的 LLM 设置
let llmSettings = { ...LLM_DEFAULTS }

// ============================================================
//  API 请求基础路径（通过 proxy.js 转发到 http://127.0.0.1:8000）
//  前端 → /apii/xxx → proxy → http://127.0.0.1:8000/xxx
// ============================================================
const API_BASE = 'apii'

// ============================================================
//  参数验证规则
//  返回 { valid: boolean, errors: string[] }
// ============================================================
function validateTtsSettings(settings) {
    const errors = []

    // prompt_language & text_language: 枚举
    const validLangs = ["中文", "English", "日本語", "韩语"]
    if (!validLangs.includes(settings.prompt_language)) {
        errors.push(`prompt_language 无效: "${settings.prompt_language}"，可选值: ${validLangs.join(", ")}`)
    }
    if (!validLangs.includes(settings.text_language)) {
        errors.push(`text_language 无效: "${settings.text_language}"，可选值: ${validLangs.join(", ")}`)
    }

    // top_k: 整数 1-100
    const topK = Number(settings.top_k)
    if (!Number.isFinite(topK) || topK < 1 || topK > 100 || !Number.isInteger(topK)) {
        errors.push(`top_k 需为 1-100 的整数，当前值: ${settings.top_k}`)
    }

    // top_p: 浮点数 0-1
    const topP = Number(settings.top_p)
    if (!Number.isFinite(topP) || topP < 0 || topP > 1) {
        errors.push(`top_p 需为 0-1 的数字，当前值: ${settings.top_p}`)
    }

    // temperature: 浮点数 0-2
    const temp = Number(settings.temperature)
    if (!Number.isFinite(temp) || temp < 0 || temp > 2) {
        errors.push(`temperature 需为 0-2 的数字，当前值: ${settings.temperature}`)
    }

    // speed: 浮点数 0.1-2.0
    const spd = Number(settings.speed)
    if (!Number.isFinite(spd) || spd < 0.1 || spd > 2.0) {
        errors.push(`speed 需为 0.1-2.0 的数字，当前值: ${settings.speed}`)
    }

    // sample_steps: 整数 1-100
    const steps = Number(settings.sample_steps)
    if (!Number.isFinite(steps) || steps < 1 || steps > 100 || !Number.isInteger(steps)) {
        errors.push(`sample_steps 需为 1-100 的整数，当前值: ${settings.sample_steps}`)
    }

    // if_sr: boolean → "true"/"false"
    if (settings.if_sr !== "true" && settings.if_sr !== "false") {
        errors.push(`if_sr 需为 "true" 或 "false"，当前值: ${settings.if_sr}`)
    }

    return { valid: errors.length === 0, errors }
}

// ============================================================
//  构建 TTS 设置 GET 请求 URL
// ============================================================
function buildTtsSettingUrl(settings) {
    const params = new URLSearchParams({
        prompt_language: settings.prompt_language,
        text_language:   settings.text_language,
        top_k:           settings.top_k,
        top_p:           settings.top_p,
        temperature:     settings.temperature,
        speed:           settings.speed,
        sample_steps:    settings.sample_steps,
        if_sr:           settings.if_sr
    })
    return `${API_BASE}/api/chat/tts/setting?${params.toString()}`
}

// ============================================================
//  发送 TTS 设置到后端
// ============================================================
async function saveTtsSettings(settings) {
    const url = buildTtsSettingUrl(settings)
    console.log("[TTS-SETTING] 发送设置请求:", url)

    try {
        const response = await fetch(url)
        if (!response.ok) {
            console.error("[TTS-SETTING] 后端返回错误:", response.status, response.statusText)
            return { success: false, message: `HTTP ${response.status}: ${response.statusText}` }
        }
        // 尝试解析 JSON（后端可能返回确认信息）
        const contentType = response.headers.get("content-type") || ""
        if (contentType.includes("application/json")) {
            const data = await response.json()
            console.log("[TTS-SETTING] 后端响应 JSON:", data)
            return { success: true, data }
        }
        console.log("[TTS-SETTING] 设置已保存（非 JSON 响应）")
        return { success: true, data: null }
    } catch (error) {
        console.error("[TTS-SETTING] 请求失败:", error)
        return { success: false, message: error.message }
    }
}

// ============================================================
//  更新调试面板中的 API URL 预览
// ============================================================
function updateDebugPanel() {
    const debugEl = document.querySelector("#tts-debug-url")
    if (debugEl) {
        // 显示完整路径方便调试（后端实际地址，经 proxy 转发）
        const fullUrl = `http://127.0.0.1:8000/api/chat/tts/setting?` +
            `prompt_language=${encodeURIComponent(ttsSettings.prompt_language)}&` +
            `text_language=${encodeURIComponent(ttsSettings.text_language)}&` +
            `top_k=${ttsSettings.top_k}&` +
            `top_p=${ttsSettings.top_p}&` +
            `temperature=${ttsSettings.temperature}&` +
            `speed=${ttsSettings.speed}&` +
            `sample_steps=${ttsSettings.sample_steps}&` +
            `if_sr=${ttsSettings.if_sr}`
        debugEl.textContent = fullUrl
    }
}

// ============================================================
//  TTS 设置弹窗控制
// ============================================================
function initTtsSettingsModal() {
    const overlay    = document.querySelector("#tts-modal-overlay")
    // ★ 侧边栏按钮（与新建对话同款样式）
    const openBtn    = document.querySelector("#tts-settings-sidebar-btn")
    const closeBtn   = document.querySelector("#tts-modal-close")
    const saveBtn    = document.querySelector("#tts-save-btn")
    const resetBtn   = document.querySelector("#tts-reset-btn")

    // ---- DOM 元素引用（用于双向同步） ----
    const elements = {
        prompt_language: document.querySelector("#tts-prompt-language"),
        text_language:   document.querySelector("#tts-text-language"),
        top_k:           document.querySelector("#tts-top-k"),
        top_k_range:     document.querySelector("#tts-top-k-range"),
        top_p:           document.querySelector("#tts-top-p"),
        top_p_range:     document.querySelector("#tts-top-p-range"),
        temperature:     document.querySelector("#tts-temperature"),
        temperature_range: document.querySelector("#tts-temperature-range"),
        speed:           document.querySelector("#tts-speed"),
        speed_range:     document.querySelector("#tts-speed-range"),
        sample_steps:    document.querySelector("#tts-sample-steps"),
        sample_steps_range: document.querySelector("#tts-sample-steps-range"),
        if_sr:           document.querySelector("#tts-if-sr")
    }

    // ---- 从 ttsSettings 填充表单 ----
    function populateForm() {
        elements.prompt_language.value = ttsSettings.prompt_language
        elements.text_language.value   = ttsSettings.text_language

        elements.top_k.value           = ttsSettings.top_k
        elements.top_k_range.value     = ttsSettings.top_k

        elements.top_p.value           = ttsSettings.top_p
        elements.top_p_range.value     = ttsSettings.top_p

        elements.temperature.value     = ttsSettings.temperature
        elements.temperature_range.value = ttsSettings.temperature

        elements.speed.value           = ttsSettings.speed
        elements.speed_range.value     = ttsSettings.speed

        elements.sample_steps.value    = ttsSettings.sample_steps
        elements.sample_steps_range.value = ttsSettings.sample_steps

        elements.if_sr.checked         = (ttsSettings.if_sr === "true")

        // 清除所有验证信息
        document.querySelectorAll(".tts-validation-msg").forEach(el => el.textContent = "")

        // 更新调试面板
        updateDebugPanel()
    }

    // ---- 从表单读取当前值到临时对象 ----
    function readForm() {
        return {
            prompt_language: elements.prompt_language.value,
            text_language:   elements.text_language.value,
            top_k:           elements.top_k.value,
            top_p:           elements.top_p.value,
            temperature:     elements.temperature.value,
            speed:           elements.speed.value,
            sample_steps:    elements.sample_steps.value,
            if_sr:           elements.if_sr.checked ? "true" : "false"
        }
    }

    // ---- 显示单字段验证错误 ----
    function showFieldError(fieldId, message) {
        const msgEl = document.querySelector(`.tts-validation-msg[data-for="${fieldId}"]`)
        if (msgEl) {
            msgEl.textContent = message || ""
        }
    }

    // ---- 打开弹窗 ----
    function openModal() {
        populateForm()
        syncAllCustomSelects()            // 刷新自定义下拉触发器
        overlay.classList.add("active")
        console.log("[TTS-MODAL] 弹窗已打开，当前设置:", ttsSettings)
        updateDebugPanel()
    }

    // ---- 关闭弹窗 ----
    function closeModal() {
        overlay.classList.remove("active")
        console.log("[TTS-MODAL] 弹窗已关闭")
    }

    // ---- 保存设置 ----
    async function saveSettings() {
        const newSettings = readForm()

        // ★ 参数验证
        const { valid, errors } = validateTtsSettings(newSettings)

        // 清除所有旧的验证信息
        document.querySelectorAll(".tts-validation-msg").forEach(el => el.textContent = "")

        if (!valid) {
            console.warn("[TTS-VALIDATION] 验证失败:", errors)
            // 根据错误信息定位到具体字段并显示
            errors.forEach(err => {
                if (err.includes("prompt_language")) showFieldError("tts-prompt-language", err)
                if (err.includes("text_language"))   showFieldError("tts-text-language", err)
                if (err.includes("top_k"))           showFieldError("tts-top-k", err)
                if (err.includes("top_p"))           showFieldError("tts-top-p", err)
                if (err.includes("temperature"))     showFieldError("tts-temperature", err)
                if (err.includes("speed"))           showFieldError("tts-speed", err)
                if (err.includes("sample_steps"))    showFieldError("tts-sample-steps", err)
                if (err.includes("if_sr"))           showFieldError("tts-if-sr", err)
            })
            return
        }

        console.log("[TTS-VALIDATION] 验证通过，准备发送:", newSettings)

        // ★ 发送到后端
        const result = await saveTtsSettings(newSettings)

        if (result.success) {
            // 更新内存中的设置
            ttsSettings = { ...newSettings }
            console.log("[TTS-SETTING] ✅ 设置已生效:", ttsSettings)
            closeModal()
        } else {
            alert(`TTS 设置保存失败: ${result.message || "未知错误"}`)
        }
    }

    // ---- 恢复默认 ----
    function resetToDefaults() {
        ttsSettings = { ...TTS_DEFAULTS }
        populateForm()
        syncAllCustomSelects()            // 刷新自定义下拉触发器
        console.log("[TTS-MODAL] 已恢复默认设置:", ttsSettings)
        updateDebugPanel()
    }

    // ---- 滑块 ↔ 数字输入 双向同步 ----
    function syncRangeToNumber(rangeEl, numberEl) {
        numberEl.value = rangeEl.value
        const tempSettings = readForm()
        ttsSettings = { ...tempSettings }
        updateDebugPanel()
    }
    function syncNumberToRange(numberEl, rangeEl) {
        const val = Number(numberEl.value)
        const min = Number(rangeEl.min)
        const max = Number(rangeEl.max)
        if (!isNaN(val) && val >= min && val <= max) {
            rangeEl.value = val
        }
        const tempSettings = readForm()
        ttsSettings = { ...tempSettings }
        updateDebugPanel()
    }

    // 绑定滑块 → 数字
    elements.top_k_range.addEventListener("input",     () => syncRangeToNumber(elements.top_k_range, elements.top_k))
    elements.top_p_range.addEventListener("input",     () => syncRangeToNumber(elements.top_p_range, elements.top_p))
    elements.temperature_range.addEventListener("input", () => syncRangeToNumber(elements.temperature_range, elements.temperature))
    elements.speed_range.addEventListener("input",     () => syncRangeToNumber(elements.speed_range, elements.speed))
    elements.sample_steps_range.addEventListener("input", () => syncRangeToNumber(elements.sample_steps_range, elements.sample_steps))

    // 绑定数字 → 滑块
    elements.top_k.addEventListener("input",     () => syncNumberToRange(elements.top_k, elements.top_k_range))
    elements.top_p.addEventListener("input",     () => syncNumberToRange(elements.top_p, elements.top_p_range))
    elements.temperature.addEventListener("input", () => syncNumberToRange(elements.temperature, elements.temperature_range))
    elements.speed.addEventListener("input",     () => syncNumberToRange(elements.speed, elements.speed_range))
    elements.sample_steps.addEventListener("input", () => syncNumberToRange(elements.sample_steps, elements.sample_steps_range))

    // 切换开关也更新调试面板
    elements.if_sr.addEventListener("change", () => {
        const tempSettings = readForm()
        ttsSettings = { ...tempSettings }
        updateDebugPanel()
    })

    // 下拉框变化更新调试面板
    elements.prompt_language.addEventListener("change", () => {
        const tempSettings = readForm()
        ttsSettings = { ...tempSettings }
        updateDebugPanel()
    })
    elements.text_language.addEventListener("change", () => {
        const tempSettings = readForm()
        ttsSettings = { ...tempSettings }
        updateDebugPanel()
    })

    // ---- 事件绑定 ----
    openBtn.addEventListener("click", openModal)
    closeBtn.addEventListener("click", closeModal)
    saveBtn.addEventListener("click", saveSettings)
    resetBtn.addEventListener("click", resetToDefaults)

    // 点击遮罩关闭
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeModal()
    })

    // ESC 关闭
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && overlay.classList.contains("active")) {
            closeModal()
        }
    })

    console.log("[TTS-MODAL] 初始化完成 | 默认设置:", TTS_DEFAULTS)
    console.log("[TTS-MODAL] 设置 API 端点: GET /api/chat/tts/setting?prompt_language=...&text_language=...&...")
}

// ============================================================
//  LLM 模型设置（输入框底部选择栏）
// ============================================================
function buildLlmSettingUrl(settings) {
    const params = new URLSearchParams({
        llm_model:        settings.llm_model,
        thinking:         settings.thinking,
        reasoning_effort: settings.reasoning_effort
    })
    return `${API_BASE}/api/chat/setting?${params.toString()}`
}

async function saveLlmSettings(settings) {
    const url = buildLlmSettingUrl(settings)
    console.log("[LLM-SETTING] 发送模型设置请求:", url)
    console.log("[LLM-SETTING] 后端实际地址:", `http://127.0.0.1:8000/api/chat/setting?llm_model=${settings.llm_model}&thinking=${settings.thinking}&reasoning_effort=${settings.reasoning_effort}`)

    try {
        const response = await fetch(url)
        if (!response.ok) {
            console.error("[LLM-SETTING] 后端返回错误:", response.status, response.statusText)
            return { success: false, message: `HTTP ${response.status}: ${response.statusText}` }
        }
        const contentType = response.headers.get("content-type") || ""
        if (contentType.includes("application/json")) {
            const data = await response.json()
            console.log("[LLM-SETTING] 后端响应 JSON:", data)
            return { success: true, data }
        }
        console.log("[LLM-SETTING] 设置已保存")
        return { success: true, data: null }
    } catch (error) {
        console.error("[LLM-SETTING] 请求失败:", error)
        return { success: false, message: error.message }
    }
}

function initLlmSettings() {
    const modelSelect   = document.querySelector("#llm-model-select")
    const thinkSelect   = document.querySelector("#thinking-select")
    const effortSelect  = document.querySelector("#reasoning-effort-select")

    if (!modelSelect || !thinkSelect || !effortSelect) {
        console.warn("[LLM-SETTING] 未找到模型设置 DOM 元素，跳过初始化")
        return
    }

    // 从 llmSettings 填充下拉框
    function populateSelects() {
        modelSelect.value  = llmSettings.llm_model
        thinkSelect.value  = llmSettings.thinking
        effortSelect.value = llmSettings.reasoning_effort
        syncAllCustomSelects()            // 刷新触发器显示
    }

    // 读取当前选择 → 保存到后端
    async function applySettings() {
        const newSettings = {
            llm_model:        modelSelect.value,
            thinking:         thinkSelect.value,
            reasoning_effort: effortSelect.value
        }
        const result = await saveLlmSettings(newSettings)
        if (result.success) {
            llmSettings = { ...newSettings }
            console.log("[LLM-SETTING] ✅ 模型设置已生效:", llmSettings)
        } else {
            console.warn("[LLM-SETTING] ⚠️ 设置保存失败，回滚到:", llmSettings)
            // 回滚下拉框显示
            populateSelects()
        }
    }

    // 下拉框变化时自动发送设置
    modelSelect.addEventListener("change", applySettings)
    thinkSelect.addEventListener("change", applySettings)
    effortSelect.addEventListener("change", applySettings)

    // 初始填充
    populateSelects()

    console.log("[LLM-SETTING] 初始化完成 | 默认设置:", LLM_DEFAULTS)
    console.log("[LLM-SETTING] 设置 API 端点: GET /api/chat/setting?llm_model=...&thinking=...&reasoning_effort=...")
}

// ============================================================
//  消息发送相关（保持原有逻辑不变）
// ============================================================

async function get_message(session_id, role, content, time){
    const baseUrl = `${API_BASE}/api/chat/send`
    const text_type = 'single'
    const params = new URLSearchParams({
        text_type,
        session_id,
        role,
        content,
        time
    })
    const fullUrl = `${baseUrl}?${params.toString()}`
    console.log("[LLM-REQUEST] GET", fullUrl)

    try {
        const response = await fetch(fullUrl)
        const resJson = await response.json()
        console.log("[LLM-RESPONSE]", resJson.content)
        return resJson.content
    } catch (error) {
        console.error("[LLM-ERROR] 请求 LLM 失败:", error)
        throw error
    }
}

// ============================================================
//  TTS 语音合成（使用当前 TTS 设置）
// ============================================================
async function get_tts(text){
    const baseUrl = `${API_BASE}/api/chat/tts`
    const params = new URLSearchParams({
        text,
        prompt_language: ttsSettings.prompt_language,
        text_language:   ttsSettings.text_language,
        top_k:           ttsSettings.top_k,
        top_p:           ttsSettings.top_p,
        temperature:     ttsSettings.temperature,
        speed:           ttsSettings.speed,
        sample_steps:    ttsSettings.sample_steps,
        if_sr:           ttsSettings.if_sr
    })
    const fullUrl = `${baseUrl}?${params.toString()}`
    console.log("[TTS-REQUEST] GET", fullUrl)

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)()

    const response = await fetch(fullUrl)
    const arrayBuffer = await response.arrayBuffer()
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
    console.log("[TTS-SUCCESS] 音频解码完成，开始播放")
    const source = audioCtx.createBufferSource()
    source.buffer = audioBuffer

    source.connect(audioCtx.destination)
    source.start()

    source.onended = () => {
        console.log("[TTS-END] 播放结束")
    }
}

// ============================================================
//  UI 交互逻辑
// ============================================================

const message_history = document.querySelector(".message-history")

// 发送信息
function send_message(){
    const send_button  = document.querySelector("#seed-button")
    const message_element = document.querySelector("#message-textarea")
    const messages     = document.querySelector(".messages")
    const message_history = document.querySelector(".message-history")

    async function handleSend() {
        const message = message_element.value
        if (!message.trim()) return  // 空消息不发送

        // 显示我的消息
        const element = `<div class="chat-message self">
            <div class="chat-avatar chat-avatar-self"></div>
            <div class="chat-content">
                <div class="chat-name">我</div>
                <div class="chat-bubble glass">${message}</div>
            </div>
        </div>`
        messages.insertAdjacentHTML("beforeend", element)
        message_history.scrollTo({
            top: message_history.scrollHeight,
            behavior: "smooth"
        })
        message_element.value = ""
        console.log("[USER-MESSAGE]", message)

        // 请求 LLM
        let answer = await get_message(
            "123456",
            "牛魔",
            message,
            new Date().toLocaleString()
        )
        const answerElement = `<div class="chat-message other">
            <div class="chat-avatar chat-avatar-other"></div>
            <div class="chat-content">
                <div class="chat-name">Marionette</div>
                <div class="chat-bubble glass">${answer}</div>
            </div>
        </div>`
        messages.insertAdjacentHTML("beforeend", answerElement)
        message_history.scrollTo({
            top: message_history.scrollHeight,
            behavior: "smooth"
        })

        // TTS 请求（使用当前 TTS 设置）
        await get_tts(answer)
    }

    send_button.addEventListener("click", handleSend)

    message_element.addEventListener("keyup", async (e) => {
        if (e.key === "Enter") {
            await handleSend()
        }
    })
}

// 清空对话
async function new_chat(){
    const baseUrl = `${API_BASE}/api/chat/clear`
    try {
        const response = await fetch(baseUrl)
        console.log("[CHAT-CLEAR]", response.status)
    } catch (error) {
        console.error("[CHAT-CLEAR-ERROR]", error)
    }
}

function clear_messages(){
    const clear_button = document.querySelector("#create-new-chat")
    clear_button.addEventListener("click", () => {
        new_chat()
        // ★ 在点击时重新查询，否则获取的是页面初始化时的空列表
        const all_messages = document.querySelectorAll(".chat-message")
        all_messages.forEach(message => message.remove())
        console.log("[CHAT-CLEAR] 所有消息已清除")
    })
}

// ============================================================
//  自定义下拉框组件（替换原生 select 样式）
//  遍历所有 select.tts-select / select.model-select，包裹为 .c-select
// ============================================================
function initCustomSelects() {
    const selects = document.querySelectorAll('select.tts-select, select.model-select')
    if (selects.length === 0) return

    selects.forEach(select => {
        // 避免重复初始化
        if (select.closest('.c-select')) return

        // 创建容器
        const wrapper = document.createElement('div')
        wrapper.className = 'c-select'
        select.parentNode.insertBefore(wrapper, select)
        wrapper.appendChild(select)

        // 触发器
        const trigger = document.createElement('div')
        trigger.className = 'c-select-trigger'

        const valueSpan = document.createElement('span')
        valueSpan.className = 'c-select-value'

        const arrowSvg = document.createElement('span')
        arrowSvg.innerHTML = `<svg class="c-select-arrow" viewBox="0 0 12 8" width="12" height="8"><path d="M1 1.5l5 5 5-5" stroke="#888" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`

        trigger.appendChild(valueSpan)
        trigger.appendChild(arrowSvg)
        wrapper.appendChild(trigger)

        // 选项面板
        const optionsPanel = document.createElement('div')
        optionsPanel.className = 'c-select-options'
        wrapper.appendChild(optionsPanel)

        // 根据原生 select 构建选项
        function buildOptionEls() {
            optionsPanel.innerHTML = ''
            Array.from(select.options).forEach(opt => {
                const el = document.createElement('div')
                el.className = 'c-select-option'
                el.textContent = opt.text
                el.dataset.value = opt.value
                if (opt.selected) el.classList.add('selected')

                el.addEventListener('click', () => {
                    // 更新原生 select
                    select.value = opt.value
                    // 更新触发器文字
                    valueSpan.textContent = opt.text
                    // 更新选中样式
                    optionsPanel.querySelectorAll('.c-select-option').forEach(o => o.classList.remove('selected'))
                    el.classList.add('selected')
                    // 关闭面板
                    wrapper.classList.remove('open')
                    // 派发 change 事件（让现有监听器生效）
                    select.dispatchEvent(new Event('change', { bubbles: true }))
                })
                optionsPanel.appendChild(el)
            })
        }
        buildOptionEls()

        // 初始显示
        const syncTrigger = () => {
            const sel = select.options[select.selectedIndex]
            if (sel) valueSpan.textContent = sel.text
        }
        syncTrigger()

        // 点击触发器 → 开关面板
        trigger.addEventListener('click', (e) => {
            e.stopPropagation()
            const wasOpen = wrapper.classList.contains('open')
            // 关闭所有其他下拉
            document.querySelectorAll('.c-select.open').forEach(el => el.classList.remove('open'))
            if (!wasOpen) {
                wrapper.classList.add('open')
            }
        })

        // 点击外部关闭
        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) {
                wrapper.classList.remove('open')
            }
        })

        // 暴露 sync 方法到 wrapper
        wrapper._sync = syncTrigger
    })
}

// 同步所有自定义下拉的显示值（在 JS 修改了原生 select.value 后调用）
function syncAllCustomSelects() {
    document.querySelectorAll('.c-select').forEach(w => {
        if (w._sync) w._sync()
    })
}

// ============================================================
//  侧边栏收回/展开
// ============================================================
function initSidebarToggle() {
    const toggleBtn  = document.querySelector("#sidebar-toggle")
    const sideBar    = document.querySelector(".side-bar")

    if (!toggleBtn || !sideBar) return

    let collapsed = false

    toggleBtn.addEventListener("click", () => {
        collapsed = !collapsed
        if (collapsed) {
            sideBar.classList.add("collapsed")
            toggleBtn.classList.add("collapsed")
        } else {
            sideBar.classList.remove("collapsed")
            toggleBtn.classList.remove("collapsed")
        }
        console.log("[SIDEBAR]", collapsed ? "侧边栏已收起" : "侧边栏已展开")
    })

    console.log("[SIDEBAR] 切换按钮已就绪（点击顶部栏左侧汉堡图标）")
}

// ============================================================
//  启动：初始化所有模块
// ============================================================
// ★ 先初始化自定义下拉，把原生 select 包裹起来
initCustomSelects()
send_message()
clear_messages()
initTtsSettingsModal()
initLlmSettings()
initSidebarToggle()

// 页面加载完成后滚动到底部
document.addEventListener("DOMContentLoaded", function (){
    message_history.scrollTop = message_history.scrollHeight
})

// ============================================================
//  调试辅助：在浏览器控制台暴露 TTS 设置对象
//  使用方法：在 DevTools 控制台中输入 ttsSettings 查看当前设置
//           ttsSettings.temperature = "0.5" 直接修改
//           buildTtsSettingUrl(ttsSettings) 预览请求 URL
//           validateTtsSettings(ttsSettings) 手动验证
// ============================================================
console.log("🛠 调试 API 已就绪:")
console.log("  [TTS]")
console.log("    ttsSettings          — 查看/修改当前 TTS 设置")
console.log("    TTS_DEFAULTS         — TTS 默认值")
console.log("    buildTtsSettingUrl() — 构建 TTS 请求 URL")
console.log("    validateTtsSettings()— TTS 参数验证")
console.log("    saveTtsSettings()    — 手动发送 TTS 设置到后端")
console.log("  [LLM]")
console.log("    llmSettings          — 查看/修改当前模型设置")
console.log("    LLM_DEFAULTS         — 模型默认值")
console.log("    buildLlmSettingUrl() — 构建模型设置 URL")
console.log("    saveLlmSettings()    — 手动发送模型设置到后端")
console.log("  API 代理: /apii/xxx → http://127.0.0.1:8000/xxx")
