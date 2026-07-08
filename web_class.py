"""
功能整合
"""
from datetime import datetime
import json

import config
from llm import Llm
from tts import Tts
from file import File

nowtime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
history_path = "save/text/test/history.json"
content_path = "save/text/test/content.json"

save_wave_path = "save/wav/test.wav"

config_tts = config.TTS()
tts_mode = config_tts.TTS_MODE
refer_wav_path = File.refer_wave_path(name=tts_mode)
prompt_text = File.get_wav_text(name=tts_mode)

setting = {
  "text_type": "setting",
  "setting_id": "1234455",
  "llm_model": "deepseek-v4-flash",
  "thinking": "enabled",
  "reasoning_effort": "high",
  "tts_setting": {
    "prompt_language": config_tts.BASIC_SETTING["prompt_language"],
    "text_language": config_tts.BASIC_SETTING["text_language"],
    "top_k": config_tts.BASIC_SETTING["top_k"],
    "top_p": config_tts.BASIC_SETTING["top_p"],
    "temperature": config_tts.BASIC_SETTING["temperature"],
    "speed": config_tts.BASIC_SETTING["speed"],
    "sample_steps": config_tts.BASIC_SETTING["sample_steps"],
    "if_sr": config_tts.BASIC_SETTING["if_sr"]
  }
}

#临时更改模型
tts = Tts()
tts.change_tts_model(name=tts_mode, model_version="v4")

class Api:

    @staticmethod
    def send_message(text_type: str,
                     session_id: str,
                     role: str,
                     content: str,
                     time: str):
        """
        发送消息
        :param text_type: 文本类型
        :param session_id: 会话id
        :param role: 角色
        :param content: 内容
        :param time: 时间
        :return:发送对应格式json
        """
        if text_type == "single":
            """
            得到参数，
            存入history
            发给llm 
            得到llm              发送失败不存
            存入history          回复错误
            """
            file = File()
            # user存入
            file.history_rewrite(
                path=history_path,
                text_type=text_type,
                session_id=session_id,
                role=role,
                content=content,
                time=time
            )
            # 发送llm
            #验证system prompt
            file.system_prompt_rewrite(path=content_path,
                                       prompt=config.PROMPT_SYSTEM)
            #读取 并存user content
            whole_content = file.content_rewrite(
                role="user",
                content=content,
                path=content_path
            )
            # 发送llm
            llm = Llm()
            # 验证模型设置
            llm.model = setting["llm_model"]
            llm.thinking = setting["thinking"]
            llm.reasoning_effort = setting["reasoning_effort"]
            try:
                answer = llm.deepseek_chat(content = whole_content)
                # ai存入history
                file.history_rewrite(
                    path=history_path,
                    text_type=text_type,
                    session_id=session_id,
                    role=role,
                    content=answer,
                    time=nowtime
                )
                # ai存入content
                file.content_rewrite(
                    role="assistant",
                    content=answer,
                    path=content_path
                )
                give_back = {
                    "text_type": text_type,
                    "session_id": session_id,
                    "role": role,
                    "content": answer,
                    "time": nowtime
                }
                return  give_back
            except Exception as e:
                print("llm error:", e)
                give_back = {
                    "text_type": text_type,
                    "session_id": session_id,
                    "role": role,
                    "content": "llm error",
                    "time": nowtime
                }
                return give_back

        else:
            give_back = {
                "text_type": "single",
                "session_id": session_id,
                "role": role,
                "content": "text_type error",
                "time": nowtime
            }
            return give_back

    @staticmethod
    def send_tts(content:str):
        """
        发送tts
        :param content: 文本
        :return:wav格式二进制
        """
        """1.拿到所需tts文本
        2.进行tts生成请求         
        3.保存tts语音            生成失败返回0
        4，返回wav二进制        """
        #tts生成
        tts = Tts()
        # 去除括号
        remove_brackets_text = tts.remove_brackets(text=content)
        tts_wave = tts.generate_tts(refer_wav_path=refer_wav_path,
                                    prompt_text=prompt_text,
                                    texts=remove_brackets_text,
                                    prompt_language=setting["tts_setting"]["prompt_language"],
                                    text_language=setting["tts_setting"]["text_language"],
                                    top_k=setting["tts_setting"]["top_k"],
                                    top_p=setting["tts_setting"]["top_p"],
                                    temperature=setting["tts_setting"]["temperature"],
                                    speed=setting["tts_setting"]["speed"],
                                    sample_steps=setting["tts_setting"]["sample_steps"],
                                    if_sr=setting["tts_setting"]["if_sr"])
        tts.save_as_wav(content=tts_wave,
                        path=save_wave_path)
        return tts_wave
    @staticmethod
    def change_tts_setting(prompt_language: str,
                           text_language: str,
                           top_k: str,
                           top_p: str,
                           temperature: str,
                           speed: str,
                           sample_steps: str,
                           if_sr: str):
        """
        修改tts设置
        """
        setting["tts_setting"] = {
            "prompt_language": prompt_language,
            "text_language": text_language,
            "top_k": top_k,
            "top_p": top_p,
            "temperature": temperature,
            "speed": speed,
            "sample_steps": sample_steps,
            "if_sr": if_sr
        }
        print(setting["tts_setting"])
        return "tts setting succeed"
    @staticmethod
    def change_llm_setting(llm_model: str,
                           thinking: str,
                           reasoning_effort: str):
        """
        修改llm设置
        """
        setting["llm_setting"] = llm_model
        setting["thinking"] = thinking
        setting["reasoning_effort"] = reasoning_effort
        print(setting["llm_setting"], setting["thinking"], setting["reasoning_effort"])
        return "llm setting succeed"
    @staticmethod
    def clear_history_content():
        """
        清空历史记录
        :return:
        """
        file = File()
        file.content_clear(path=content_path)
        file.history_clear(path=history_path)
        return "clear success"



if __name__ == '__main__':
    print(nowtime)
    a = Api()
    # answer1 = a.send_message("single",
    #                         "12345678",
    #                         "user",
    #                         "介绍一下哆啦a梦",
    #                         nowtime)
    # print(answer1)
    wav = a.send_tts("欢迎来到我的世界")
    print(wav)
















