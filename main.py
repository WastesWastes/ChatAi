"""
进行ai聊天的后端开发，应该实现几个功能，
1.聊天的主界面
2.进行聊天内容的收取和发送
3.进行tts的语音生成
"""
import os

from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.responses import FileResponse
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi import Query
from pydantic import BaseModel

from web_class import Api

app = FastAPI()

app.mount(
    "/asset",
    StaticFiles(directory=os.path.join("pages","chat")),
    name="chat_static"
)
@app.get("/")
async def home():
    with open("./pages/chat/home.html", "r", encoding="utf-8") as f:
        html = f.read()
    return HTMLResponse(html)



# 接收信息
class ChatSend(BaseModel):
    text_type: str
    session_id: str
    role: str
    content: str
    time: str
@app.get("/api/chat/send")
async def chat_send(q: ChatSend = Query(...)):
    send_api = Api()
    a = send_api.send_message(
        text_type=q.text_type,
        session_id=q.session_id,
        role=q.role,
        content=q.content,
        time=q.time
    )
    return  a


# 清空记录
@app.get("/api/chat/clear")
async def chat_clear():
    clear_api = Api()
    a = clear_api.clear_history_content()
    return  a



# 获取记录
@app.get("/api/chat/history")
async def chat_history():
    pass

#更改llm设置
class ChatSetting(BaseModel):
    llm_model: str
    thinking: str
    reasoning_effort: str
@app.get("/api/chat/setting")
async def chat_setting(q: ChatSetting = Query(...)):
    chat_setting_api = Api()
    a = chat_setting_api.change_llm_setting(
        llm_model=q.llm_model,
        thinking=q.thinking,
        reasoning_effort=q.reasoning_effort
    )
    return a


# 获取tts语音
class ChatTts(BaseModel):
    text: str
@app.get("/api/chat/tts")
async def chat_tts(q: ChatTts = Query(...)):
    tts_api = Api()
    a = tts_api.send_tts(q.text)
    return FileResponse("save/wav/test.wav",
                             media_type="audio/wav",
                             headers={"Content-Disposition": "attachment; filename=tts.wav"})


# 修改tts配置
class ChatTtsSetting(BaseModel):
    prompt_language: str
    text_language: str
    top_k: str
    top_p: str
    temperature: str
    speed: str
    sample_steps: str
    if_sr: str
@app.get("/api/chat/tts/setting")
async def chat_tts_setting(q: ChatTtsSetting = Query(...)):
    tts_setting_api = Api()
    a = tts_setting_api.change_tts_setting(
        prompt_language=q.prompt_language,
        text_language=q.text_language,
        top_k=q.top_k,
        top_p=q.top_p,
        temperature=q.temperature,
        speed=q.speed,
        sample_steps=q.sample_steps,
        if_sr=q.if_sr
    )
    return a




















