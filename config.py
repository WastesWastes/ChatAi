"""
基本设置文件
"""
import os


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = BASE_DIR.replace("\\", "/")
HOST = "8000"

# DeepSeek API KEY 配置在系统环境变量中
APIKEY_DEEPSEEK = os.environ.get('DEEPSEEK_API_KEY')

# 默认系统提示词设置
# PROMPT_SYSTEM = {
#     "role":"system",
#     "content":"你是一个ai助手"
# }

class TTS:
    """
    TTS 配置
    """
    TTS_HOST = "http://127.0.0.1:9880/"
    TTS_CHANGE_MODE = "http://127.0.0.1:9880/set_model"

    BASIC_SETTING = {
        "role": "wendi",  # 和版本 设置 gpt模型路径，sovits模型路径，参考语音路径
        "model_version": "v4",
        "tone": "peace",  # 设置 参考语音，参考文本
        "text": "",
        "prompt_language": "中文",
        "text_language": "中文",
        "top_k": "15",
        "top_p": "1",
        "temperature": "0.8",
        "speed": "0.9",
        "sample_steps": "32",
        "if_sr": "false",
        "change_model": "false"
    }

if __name__ == '__main__':
    print(BASE_DIR)