import ollama
import os

ollama_host = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
ollama.host = ollama_host


class ChatBot:
    def __init__(self):
        self.system_prompt = """You are a professional golf instructor and caddie. Your role is to help golfers improve their game by giving short, accurate, and concise advice strictly related to golf.

- Always respond in the context of golf.
- For most questions, give clear, brief answers using markdown format.
- If the user asks for more detail, provide a longer response (up to 250 words), still staying focused on golf without going off-topic.
- Occasionally include a light golf-related joke when appropriate.
- Do not explain general concepts unless they directly relate to golf performance or equipment.
- Alwats respond in a Markdown Format while bolding keywords and phrases.

Stay focused. Keep it helpful. Keep it on the green.
- Do not include any disclaimers or unnecessary information.
                                """
        self.messages = [{"role": "system", "content": self.system_prompt}]

    def answer_question(self, content):
        if content.lower() == "reset":
            return self.handle_reset()
        else:
            self.messages.append({"role": "user", "content": content})
            res = ollama.chat(
                model="mistral",
                messages=self.messages,
                stream=True,
                options={
                    "temperature": 0,
                },
            )  # call to Ollama
            self.messages.append(res["message"])
            return res["message"]["content"]

    def handle_conversation(self, user_input=None):
        if user_input:
            return self.answer_question(user_input)
        else:
            while True:
                user_input = input("You: ")
                if user_input.lower() == "exit":
                    break
                print(f"AI: {self.answer_question(user_input)}")

    def handle_reset(
        self,
    ):
        try:
            self.messages = [{"role": "system", "content": self.system_prompt}]
            return "Conversation Reset!"
        except Exception as exc:
            return "Oops, unable to reset converstation."


if __name__ == "__main__":
    bot = ChatBot()
    bot.handle_conversation()
