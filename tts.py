"""
tts语音的调用库
1.实现语音生成的接收
2.更改参考语音
3.更改语音模型
用户参数说明

用户的角色 模型版本
使用的语音模型GPT
            SOVITS
4.text=要生成的话
5.参考语音（音色），
        文本
6.  prompt_language:str = "中文",
    text_language:str = "中文",
    top_k:str = "15",
    top_p:str = "1",
    temperature:str = "0.8",
    speed:str = "1",
    sample_steps:str = "32",
"""
import requests
import config
import os
import re

class Tts:
    def __init__(self):
        # 模型路径
        self.tts_mode_gpt = os.path.join("tts_mode",
                                         "gpt_v4",
                                         "gpt_wendi.ckpt"
                                         )
        self.tts_mode_sovits = os.path.join("tts_mode",
                                            "sovits_v4",
                                            "sovits_wendi.pth")
        # 参考语音路径
        self.refer_wav_path = f"{config.BASE_DIR}/tts_refer_wave/wendi/peace_wendi.wav"
        # 参考语音
        self.prompt_text = "骑士团代理团长大人？你觉得他是个怎样的人"  # 测试用
        # 基本设置
        self.prompt_language = "中文"
        self.text_language = "中文"
        self.top_k = "15"
        self.top_p = "1"
        self.temperature = "0.8"
        self.speed = "1"
        self.sample_steps = "32"
        self.if_sr = "false"

    @staticmethod
    def change_tts_model(name: str ,
                         model_version: str = "v4"):
        """
        切换tts模型
        :param name: 模型名称
        :param model_version: 模型版本
        :return: 切换标语
        """
        url = config.TTS.TTS_CHANGE_MODE
        tts_mode_gpt = f"{config.BASE_DIR}/tts_mode"
        tts_mode_sovits = f"{config.BASE_DIR}/tts_mode"

        match model_version:
            case "v4":
                tts_mode_gpt = tts_mode_gpt + f"/gpt_v4/gpt_{name}.ckpt"
                tts_mode_sovits += f"/sovits_v4/sovits_{name}.pth"
            case "v2pro":
                tts_mode_gpt += f"/gpt_v2pro/gpt_{name}.ckpt"
                tts_mode_sovits += f"/sovits_v2pro/sovits_{name}.pth"
            case _:
                print("请选择正确的模型版本")

        url_set_model = (url + "?"
                         + "gpt_model_path="
                         + tts_mode_gpt
                         + "&sovits_model_path="
                         + tts_mode_sovits)
        try:
            change_mode = requests.get(url_set_model)
            print(change_mode.status_code, change_mode.text)
            print(tts_mode_gpt)
            print(url_set_model)
            return change_mode.status_code
        except Exception as e:
            print("切换模型失败:", e)
            return "切换模型失败"
    @staticmethod
    def generate_tts(
                     refer_wav_path: str,
                     prompt_text: str,
                     texts: str,
                     prompt_language: str = "中文",
                     text_language: str = "中文",
                     top_k: str = "15",
                     top_p: str = "1",
                     temperature: str = "0.8",
                     speed: str = "1",
                     sample_steps: str = "32",
                     if_sr: str = "false"):
        """
            语音生成
            :param refer_wav_path: 参考语音路径
            :param prompt_text: 提示语
            :param texts: 文本
            :param prompt_language: 提示语语言
            :param text_language: 文本语言
            :param top_k: top_k
            :param top_p: top_p
            :param temperature: 温度
            :param speed: 语速
            :param sample_steps: 采样步数
            :param if_sr: 是否重采样
            :return: 生成的语音二进制
        """

        url = (config.TTS.TTS_HOST
                + "?refer_wav_path=" + refer_wav_path
                + "&prompt_text=" + prompt_text
                + "&prompt_language=" + prompt_language
                + "&text=" + texts
                + "&text_language=" + text_language
                + "&top_k=" + top_k
                + "&top_p=" + top_p
                + "&temperature=" + temperature
                + "&speed=" + speed
                + "&sample_steps=" + sample_steps
                + "&if_sr=" + if_sr)
        try:
            get_tts = requests.get(url)
            print("生成成功")
            return get_tts.content
        except Exception as e:
            print("生成失败",e)
            return "error"
    @staticmethod
    def save_as_wav(content: bytes, path: str):
        """
        保存为wav文件
        :param content: 二进制内容
        :param path: 保存路径
        :return: 1/0 success/error
        """
        try:
            with open(path, "wb") as wav_save:
                wav_save.write(content)
            print("保存成功")
            return "1"
        except Exception as e:
            print("保存失败",e)
            return "0"
    @staticmethod
    def remove_brackets(text: str):
        """
        去除括号中的文字
        :param text: 文本
        :return: 处理好的文本
        """
        # 多次循环处理嵌套括号，直到没有括号为止
        # 去除中文括号及其内容
        while '（' in text and '）' in text:
            new_text = re.sub(r'（[^）]*）', '', text)
            if new_text == text:
                break
            text = new_text
        # 去除英文括号及其内容
        while '(' in text and ')' in text:
            new_text = re.sub(r'\([^)]*\)', '', text)
            if new_text == text:
                break
            text = new_text
        # 清理剩余的不匹配括号
        text = text.replace(')', '').replace('(', '').replace('）', '').replace('（', '')
        return text
if __name__ == '__main__':
    tts = Tts()
    # tts.change_tts_model("wendi", "v4")
    a = tts.generate_tts(tts.refer_wav_path,tts.prompt_text,"哈哈哈，及你太美")
    tts.save_as_wav(a, "test")



















