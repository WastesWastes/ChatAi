# ChatAi.

基于gpt-sovits api的语音生成ai聊天

## 项目简介

一套前端网页+python后端的聊天服务，接入gpt-sovits的语音生成api，感谢gpt—sovits的开发，目前只是固定语音模型，固定提示词。

## 环境依赖

- 网页端
- python >= 3.10 （开发使用3.14）
- Fastapi
- Uvicorn
- openai
- requests
- gpt—sovits api服务端

## QUICK START（快速开始）

1. 启动gpt—sovits api服务端，记录端口号  
   可在config.py中修改（默认为9880）

2. 配置deepseekapi系统环境变量

3. 安装Python依赖  
   `pip install -r requirements.txt`

4. gpt模型和sovits模型放入tts_mod中的对应版本文件

5. 启动后端服务  
   点击start.bat

6. 在浏览器输入本机url及端口号即可访问  
   默认 `http://127.0.0.1:8000/`

## 后言

关于tts参数调整，提示词可更改，文件保存，语音保存等持续优化~~~