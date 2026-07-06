"""
功能整合
"""
from datetime import datetime
from idlelib import history
import json

import config
from llm import Llm
from tts import Tts
from file import File

nowtime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
history_path = "save/text/test/history.json"
content_path = "save/text/test/content.json"

save_wave_path = "save/wav/test.wav"
refer_wav_path = f"{config.BASE_DIR}/tts_refer_wave/wendi/peace_wendi.wav"
prompt_text = "骑士团代理团长大人？你觉得他是个怎样的人"

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
            #读取 并存user content
            whole_content = file.content_rewrite(
                role="user",
                content=content,
                path=content_path
            )
            # 发送llm
            llm = Llm()
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
        remove_brackets_text = tts.remove_brackets(text=content)
        tts_wave = tts.generate_tts(refer_wav_path=refer_wav_path,
                                    prompt_text=prompt_text,
                                    texts=remove_brackets_text)
        tts.save_as_wav(content=tts_wave,
                        path=save_wave_path)
        return tts_wave
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
















