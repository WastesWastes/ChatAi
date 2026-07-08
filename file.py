"""
此处用于处理文件函数库

"""
from datetime import datetime

import config
import json

nowtime_file = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

class File:
    """
    文件处理类
    """
    def __init__(self):
        self.BASE_DIR = config.BASE_DIR
        self.content_path = "save/text/test/content.json"
        self.history_path = "save/text/test/history.json"
        self.single_path = "save/text/test/single.json"

        self.text_type = "history"
        self.message_id = "12345678"
        self.role = "user"
        self.agent = "chat"
        self.time = "2023-05-05 12:00:00"
        self.content = {
          "text_type": "single",
          "session_id": "12345678",
          "role": "user",
          "content": "hello",
          "time": "2021-01-01T00:00:00Z"
      }
    @staticmethod
    def history_rewrite(
                        path: str,
                        text_type: str,
                        session_id: str,
                        role: str,
                        content: str,
                        time: str = nowtime_file,
                        ):
        """
        添加历史记录
        :param session_id: 单条消息id
        :param text_type: 文本类型
        :param role: 角色
        :param content: 传入单条消息
        :param time: 时间
        :param path: 路径
        :return: history
        """
        single_text = {
            "text_type": text_type,
            "session_id": session_id,
            "role": role,
            "content": content,
            "time": time
        }

        with open(path,"r",encoding="utf-8") as f:
            history_json = json.load(f)
        history_json["content"].append(single_text)

        with open(path,"w",encoding="utf-8") as f:
            f.write(json.dumps(history_json,indent=4))
        return history_json


    @staticmethod
    def content_rewrite(role: str,content: str,path: str):
        """
        写入内容
        :param role: 角色
        :param path: 路径
        :param content: 内容
        :return: 对话列表
        """
        text = {
            "role": role,
            "content": content
        }
        with open(path,"r",encoding="utf-8") as f:
            content_json = json.load(f)
        content_json.append(text)
        with open(path,"w",encoding="utf-8") as f:
            f.write(json.dumps(content_json,indent=4))
        return content_json
    @staticmethod
    def content_clear(path: str):
        """
        清空内容
        :param path: 路径
        :return:1
        """
        with open(path,"r",encoding="utf-8") as f:
            content_system = json.load(f)[0]
        with open(path,"w",encoding="utf-8") as f:
            f.write(json.dumps([content_system],indent=4))
        return 1
    @staticmethod
    def history_clear(path: str):
        """
        清空历史记录
        :param path: 路径
        :return: 1
        """
        with open(path,"r",encoding="utf-8") as f:
            history_json = json.load(f)
            history_json["content"] = []
        with open(path,"w",encoding="utf-8") as f:
            f.write(json.dumps(history_json,indent=4))
    @staticmethod
    def system_prompt_rewrite(path: str,prompt: str):
        """
        写入系统提示词
        :param path: 路径
        :param prompt: 系统提示词
        :return: 1/0
        """
        with open(path,"r",encoding="utf-8") as f:
            content_json = json.load(f)
        if content_json[0] != prompt:
            content_json[0] = prompt
            with open(path,"w",encoding="utf-8") as f:
                f.write(json.dumps(content_json,indent=4))
            print("写入system prompt成功")
        return "1"
    @staticmethod
    def get_wav_text(name: str):
        """
        得到参考音频的文字
        :param name:模型名
        :return: 参考音频的文字
        """
        path_text = f"./tts_refer_wave/{name}/peace_{name}.txt"
        with open(path_text,"r",encoding="utf-8") as f:
            text = f.read()
        return text
    @staticmethod
    def refer_wave_path(name: str):
        """
        得到参考音频的路径
        :param name:模型名
        :return: 参考音频的路径
        """
        path_wav = f"{config.BASE_DIR}/tts_refer_wave/{name}/peace_{name}.wav"
        return path_wav
if __name__ == '__main__':
    file = File()
    # file.content_clear(file.content_path)
    # file.history_clear(file.history_path)
    # file.system_prompt_rewrite(file.content_path,config.PROMPT_SYSTEM)
    print(file.get_wav_text("sangduonie"))













