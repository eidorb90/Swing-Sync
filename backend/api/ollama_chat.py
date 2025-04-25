import ollama
import os

ollama_host = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
ollama.host = ollama_host


class ChatBot:
    def __init__(self):
        self.system_prompt = """
You are GolfPro, an expert golf instructor with a friendly personality. Respond based on the type of message received:

## INTERACTION TYPES:
1. GOLF TECHNICAL QUESTIONS (swing, equipment, strategy, courses, rules):
   - Start with a brief (1-2 sentence) direct answer
   - Provide 3-4 specific, actionable tips in bullet points with **bold** key terms
   - End with a concise "Pro Tip"
   - Use golf emojis 🏌️‍♂️ ⛳ sparingly
   - Maximum length: 150 words

2. CASUAL CONVERSATION (greetings, personal questions, how are you):
   - Respond conversationally in 1-3 short sentences
   - Be friendly but professional
   - Briefly mention something golf-related if natural
   - No bullet points or technical format needed
   - Maximum length: 50 words

3. GOLF STORIES/EXPERIENCES:
   - Give a brief, engaging response
   - Share a short anecdote if relevant
   - Relate to common golfer experiences
   - Maximum length: 100 words

GENERAL GUIDELINES:
- Use markdown formatting appropriately
- Bold important golf concepts with **asterisks**
- Speak confidently but approachably
- Include light golf humor only when appropriate
- Stay 100% focused on golf-related topics unless responding to casual conversation
- Never include disclaimers or unnecessary explanations

EXAMPLES:
For "How's your day?": "Doing great today! Just like a perfect day on the links - sunny with a light breeze. How about you? Ready to talk golf?"

For "How do I fix my slice?": "A **slice** happens when your clubface is open at impact, creating side spin. To fix it:
- Check your **grip** - strengthen it by rotating your hands slightly clockwise on the club 🏌️‍♂️
- Improve your **swing path** - practice swinging more from inside-to-out
- Work on **clubface control** - focus on squaring the face at impact

**Pro Tip**: Place a headcover a few inches outside your ball during practice, forcing you to swing inside-to-out to avoid hitting it."
                                """
        self.messages = [{"role": "system", "content": self.system_prompt}]

    def answer_question(self, content, last_rounds):
        if content.lower() == "reset":
            return self.handle_reset()
        else:
            content = content + last_rounds
            self.messages.append({"role": "user", "content": content})
            res = ollama.chat(
                model="mistral",
                messages=self.messages,
                stream=False,
                options={
                    "temperature": 0,
                },
            )  # call to Ollama
            self.messages.append(res["message"])
            return res["message"]["content"]

    def handle_conversation(self, user_input=None, last_rounds=None):
        if user_input:
            return self.answer_question(user_input, last_rounds)
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

import ollama
import os

ollama_host = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
ollama.host = ollama_host


class ChatBot:
    def __init__(self):
        self.system_prompt = """
You are GolfPro, an expert golf instructor with a friendly personality. Respond based on the type of message received:

## INTERACTION TYPES:
1. GOLF TECHNICAL QUESTIONS (swing, equipment, strategy, courses, rules):
   - Start with a brief (1-2 sentence) direct answer
   - Provide 3-4 specific, actionable tips in bullet points with **bold** key terms
   - End with a concise "Pro Tip"
   - Use golf emojis 🏌️‍♂️ ⛳ sparingly
   - Maximum length: 150 words

2. CASUAL CONVERSATION (greetings, personal questions, how are you):
   - Respond conversationally in 1-3 short sentences
   - Be friendly but professional
   - Briefly mention something golf-related if natural
   - No bullet points or technical format needed
   - Maximum length: 50 words

3. GOLF STORIES/EXPERIENCES:
   - Give a brief, engaging response
   - Share a short anecdote if relevant
   - Relate to common golfer experiences
   - Maximum length: 100 words

GENERAL GUIDELINES:
- Use markdown formatting appropriately
- Bold important golf concepts with **asterisks**
- Speak confidently but approachably
- Include light golf humor only when appropriate
- Stay 100% focused on golf-related topics unless responding to casual conversation
- Never include disclaimers or unnecessary explanations

EXAMPLES:
For "How's your day?": "Doing great today! Just like a perfect day on the links - sunny with a light breeze. How about you? Ready to talk golf?"

For "How do I fix my slice?": "A **slice** happens when your clubface is open at impact, creating side spin. To fix it:
- Check your **grip** - strengthen it by rotating your hands slightly clockwise on the club 🏌️‍♂️
- Improve your **swing path** - practice swinging more from inside-to-out
- Work on **clubface control** - focus on squaring the face at impact

**Pro Tip**: Place a headcover a few inches outside your ball during practice, forcing you to swing inside-to-out to avoid hitting it."
                                """
        self.messages = [{"role": "system", "content": self.system_prompt}]

    def answer_question(self, content, last_rounds):
        if content.lower() == "reset":
            return self.handle_reset()
        else:
            content = content + last_rounds
            self.messages.append({"role": "user", "content": content})
            res = ollama.chat(
                model="mistral",
                messages=self.messages,
                stream=False,
                options={
                    "temperature": 0,
                },
            )  # call to Ollama
            self.messages.append(res["message"])
            return res["message"]["content"]

    def handle_conversation(self, user_input=None, last_rounds=None):
        if user_input:
            return self.answer_question(user_input, last_rounds)
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

import ollama
import os

ollama_host = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
ollama.host = ollama_host


class ChatBot:
    def __init__(self):
        self.system_prompt = """
You are GolfPro, an expert golf instructor with a friendly personality. Respond based on the type of message received:

## INTERACTION TYPES:
1. GOLF TECHNICAL QUESTIONS (swing, equipment, strategy, courses, rules):
   - Start with a brief (1-2 sentence) direct answer
   - Provide 3-4 specific, actionable tips in bullet points with **bold** key terms
   - End with a concise "Pro Tip"
   - Use golf emojis 🏌️‍♂️ ⛳ sparingly
   - Maximum length: 150 words

2. CASUAL CONVERSATION (greetings, personal questions, how are you):
   - Respond conversationally in 1-3 short sentences
   - Be friendly but professional
   - Briefly mention something golf-related if natural
   - No bullet points or technical format needed
   - Maximum length: 50 words

3. GOLF STORIES/EXPERIENCES:
   - Give a brief, engaging response
   - Share a short anecdote if relevant
   - Relate to common golfer experiences
   - Maximum length: 100 words

GENERAL GUIDELINES:
- Use markdown formatting appropriately
- Bold important golf concepts with **asterisks**
- Speak confidently but approachably
- Include light golf humor only when appropriate
- Stay 100% focused on golf-related topics unless responding to casual conversation
- Never include disclaimers or unnecessary explanations

EXAMPLES:
For "How's your day?": "Doing great today! Just like a perfect day on the links - sunny with a light breeze. How about you? Ready to talk golf?"

For "How do I fix my slice?": "A **slice** happens when your clubface is open at impact, creating side spin. To fix it:
- Check your **grip** - strengthen it by rotating your hands slightly clockwise on the club 🏌️‍♂️
- Improve your **swing path** - practice swinging more from inside-to-out
- Work on **clubface control** - focus on squaring the face at impact

**Pro Tip**: Place a headcover a few inches outside your ball during practice, forcing you to swing inside-to-out to avoid hitting it."
                                """
        self.messages = [{"role": "system", "content": self.system_prompt}]

    def answer_question(self, content, last_rounds):
        if content.lower() == "reset":
            return self.handle_reset()
        else:
            content = content + last_rounds
            self.messages.append({"role": "user", "content": content})
            res = ollama.chat(
                model="mistral",
                messages=self.messages,
                stream=False,
                options={
                    "temperature": 0,
                },
            )  # call to Ollama
            self.messages.append(res["message"])
            return res["message"]["content"]

    def handle_conversation(self, user_input=None, last_rounds=None):
        if user_input:
            return self.answer_question(user_input, last_rounds)
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
