const GET_MESSAGE_URL = "http://127.0.0.1:8000/api/chat/send"
const GET_TTS_URL = "http://127.0.0.1:8000/api/chat/tts"
const CLEAR_MESSAGE_URL = "http://127.0.0.1:8000/api/chat/clear"
async function get_message(session_id,
                           role,
                           content,
                           time){
    const baseUrl = GET_MESSAGE_URL
    const text_type = 'single'
    const params = new URLSearchParams({
        text_type,
        session_id,
        role,
        content,
        time
    })
    const fullUrl = `${baseUrl}?${params.toString()}`

    try {
        const response = await fetch(fullUrl)
        const resJson = await response.json()
        console.log(resJson.content)
        return resJson.content
    }catch ( error){
        console.error("请求llm失败",error)
        throw  error
    }
}

async function get_tts(text){
    const baseUrl = GET_TTS_URL
    const params = new URLSearchParams({
        text
    })
    const fullUrl = `${baseUrl}?${params.toString()}`
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)()

    const response = await fetch(fullUrl)
    const arrayBuffer = await response.arrayBuffer()
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
    console.log("tts_get success")
    const source = audioCtx.createBufferSource()
    source.buffer = audioBuffer

    source.connect(audioCtx.destination)
    source.start()

    source.onended = () => {
        console.log("播放结束")
    }
}
// async function audio_play(text){
//     const baseUrl = "apii/api/chat/tts"
//     const params = new URLSearchParams({
//         text
//     })
//     const fullUrl = `${baseUrl}?${params.toString()}`
//     const audio = new Audio()
//     audio.src = fullUrl
//     audio.play()
//
// }


const message_history = document.querySelector(".message-history")

// 发送信息
function send_message(){
    // 取得发送按钮
    const send_button = document.querySelector("#seed-button")
    // 取信息元素
    const message_element = document.querySelector("#message-textarea")
    // 信息列表
    const messages = document.querySelector(".messages")
    // 信息区块
    const message_history = document.querySelector(".message-history")

    send_button.addEventListener("click", async () => {
        // 显示我的信息
        let message = message_element.value
        let element = `<div class="chat-message self">
                                <div class="chat-avatar">我</div>
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
        console.log(message)
        // 信息请求
        let answer =await get_message(
            "123456",
            "牛魔",
            message,
            new Date().toLocaleString()
        )
        let answer_element = `<div class="chat-message other">
                                <div class="chat-avatar">小夜</div>
                                <div class="chat-content">
                                    <div class="chat-name">小夜</div>
                                    <div class="chat-bubble glass">${answer}</div>
                                </div>
                            </div>`
        messages.insertAdjacentHTML("beforeend", answer_element)
        message_history.scrollTo({
            top: message_history.scrollHeight,
            behavior: "smooth"
        })
        // tts请求
        let tts = await get_tts(answer)
    })

    message_element.addEventListener("keyup",async (e) => {
        if (e.key === "Enter"){
            let message = message_element.value
            let element = `<div class="chat-message self">
                                <div class="chat-avatar">我</div>
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
            // 信息请求
            let answer =await get_message(
                "123456",
                "牛魔",
                message,
                new Date().toLocaleString()
            )
            let answer_element = `<div class="chat-message other">
                                <div class="chat-avatar">小夜</div>
                                <div class="chat-content">
                                    <div class="chat-name">小夜</div>
                                    <div class="chat-bubble glass">${answer}</div>
                                </div>
                            </div>`
            messages.insertAdjacentHTML("beforeend", answer_element)
            message_history.scrollTo({
                top: message_history.scrollHeight,
                behavior: "smooth"
            })
            // tts请求
            let tts = await get_tts(answer)
        }
    })
}


// 清空对话
async function new_chat(){

    try {
        const response = await fetch(CLEAR_MESSAGE_URL)
        console.log(response)
    }catch ( error){
        console.error("请求new_chat失败",error)
    }
}
function clear_messages(){
    const clear_button = document.querySelector("#create-new-chat span")
    const all_messages = document.querySelectorAll(".chat-message")
    clear_button.addEventListener("click", () => {
        let new_chat1 = new_chat()
        all_messages.forEach(message => {
            message.remove()
        })
    })
}






send_message()
clear_messages()




document.addEventListener("DOMContentLoaded",function (){
    message_history.scrollTop = message_history.scrollHeight
})
