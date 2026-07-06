import config
from openai import OpenAI

class Llm:
    def __init__(self):
        self.deepseek_key = config.APIKEY_DEEPSEEK
        self.model = "deepseek-v4-flash"
        self.messages = [
            {"role": "system", "content": "You are a helpful assistant"},
            {"role": "user", "content": "what is your name"}
        ]
        self.thinking = "disabled"  #enabled
        self.reasoning_effort = "high" #max

    def deepseek_chat(self,content):
        try:
            client = OpenAI(
                api_key=self.deepseek_key,
                base_url="https://api.deepseek.com")
            response = client.chat.completions.create(
                model=self.model,
                messages=content,
                stream=False,
                reasoning_effort=self.reasoning_effort,
                extra_body={"thinking": {"type": self.thinking}}
            )
            return response.choices[0].message.content
        except Exception as e:
            print("deepseek_chat error:", e)
            return "error"

if __name__ == '__main__':
    llm = Llm()
    llm.deepseek_chat("你好")