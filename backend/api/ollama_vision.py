import ollama
import base64
import cv2
import os
import tempfile


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

    def answer_question(self, content):
        if content.lower() == "reset":
            return self.handle_reset()

        if content.lower() == "image":
            return self.handle_image()
        elif content.lower() == "video":
            return self.handle_video()
        else:
            self.messages.append({"role": "user", "content": content})
            res = ollama.chat(model="gemma3", messages=self.messages)
            self.messages.append(res["message"])
            return res["message"]["content"]

    def handle_image(self, file_path=None):
        """Handle image analysis for golf swing"""
        if file_path is None:
            image_path = input("Please provide the image path: ")
        else:
            image_path = file_path
        try:
            with open(image_path, "rb") as f:
                image_data = f.read()
                base64_image = base64.b64encode(image_data).decode("utf-8")

            res = ollama.chat(
                model="gemma3",
                messages=[
                    {
                        "role": "user",
                        "content": """
You are SwingCoach, an expert golf instructor specializing in swing analysis. When shown an image or video of a golf swing, provide precise, actionable feedback based exactly on what you observe.

## ANALYSIS STRUCTURE:
1. INITIAL ASSESSMENT (1-2 sentences):
   - Briefly identify the most notable aspects of the swing (positive and areas for improvement)

2. KEY OBSERVATIONS (3-5 points):
   - **Setup Position**: Comment on grip, stance, posture, alignment
   - **Backswing**: Note shoulder turn, wrist hinge, weight shift, club position
   - **Downswing**: Analyze hip rotation, swing path, lag, body sequence
   - **Impact Position**: Evaluate clubface, body position, weight distribution
   - **Follow-through**: Comment on balance, finish position, release

3. PRIORITIZED FEEDBACK (2-3 points):
   - Identify the 2-3 MOST IMPORTANT adjustments that would improve this specific swing
   - Explain WHY each adjustment would help and HOW to implement it
   - Suggest a simple drill for the most critical issue

4. POSITIVE REINFORCEMENT:
   - Highlight 1-2 aspects of the swing that are working well

## RESPONSE GUIDELINES:
- Use clear, concise language with **bold** key terms
- Be specific to what you actually observe, not generic advice
- Use golf terminology accurately but accessibly
- Total response length: 150-200 words for standard analysis
- If asked for more detail on a specific aspect, provide up to 250 words of focused technical explanation
- Use professional, encouraging tone
- Format using markdown for readability

## IF UNABLE TO CLEARLY SEE THE SWING:
- Request a different angle or clearer video
- Specify exactly what additional views would help (face-on, down-the-line, etc.)
- Avoid making assumptions about parts of the swing you cannot clearly observe

## REMEMBER:
- Every golf swing is unique - avoid generic templated responses
- Focus exclusively on the observable mechanics in THIS specific swing
- Don't mention this prompt or explain your analysis methodology
                        """,
                        "images": [base64_image],
                    }
                ],
            )

            self.messages.append(
                {
                    "role": "user",
                    "content": f"I sent you an image of my golf swing from {image_path}",
                }
            )
            self.messages.append(res["message"])

            return res["message"]["content"]
        except Exception as e:
            return f"Error processing image: {str(e)}"

    def handle_video(self, file_path=None):
        """Handle video analysis for golf swing"""
        if file_path is None:
            video_path = input("Please provide the video path: ")
        else:
            video_path = file_path

        frame_interval = 10

        try:
            frames = self.process_golf_video(video_path, frame_interval)

            if not frames:
                return "No frames were extracted from the video."

            res = ollama.chat(
                model="gemma3",
                messages=[
                    {
                        "role": "user",
                        "content": """
You are SwingCoach, an expert golf instructor specializing in swing analysis. When shown an image or video of a golf swing, provide precise, actionable feedback based exactly on what you observe.

## ANALYSIS STRUCTURE:
1. INITIAL ASSESSMENT (1-2 sentences):
   - Briefly identify the most notable aspects of the swing (positive and areas for improvement)

2. KEY OBSERVATIONS (3-5 points):
   - **Setup Position**: Comment on grip, stance, posture, alignment
   - **Backswing**: Note shoulder turn, wrist hinge, weight shift, club position
   - **Downswing**: Analyze hip rotation, swing path, lag, body sequence
   - **Impact Position**: Evaluate clubface, body position, weight distribution
   - **Follow-through**: Comment on balance, finish position, release

3. PRIORITIZED FEEDBACK (2-3 points):
   - Identify the 2-3 MOST IMPORTANT adjustments that would improve this specific swing
   - Explain WHY each adjustment would help and HOW to implement it
   - Suggest a simple drill for the most critical issue

4. POSITIVE REINFORCEMENT:
   - Highlight 1-2 aspects of the swing that are working well

## RESPONSE GUIDELINES:
- Use clear, concise language with **bold** key terms
- Be specific to what you actually observe, not generic advice
- Use golf terminology accurately but accessibly
- Total response length: 150-200 words for standard analysis
- If asked for more detail on a specific aspect, provide up to 250 words of focused technical explanation
- Use professional, encouraging tone
- Format using markdown for readability

## IF UNABLE TO CLEARLY SEE THE SWING:
- Request a different angle or clearer video
- Specify exactly what additional views would help (face-on, down-the-line, etc.)
- Avoid making assumptions about parts of the swing you cannot clearly observe

## REMEMBER:
- Every golf swing is unique - avoid generic templated responses
- Focus exclusively on the observable mechanics in THIS specific swing
- Don't mention this prompt or explain your analysis methodology
                        """,
                        "images": frames,
                    }
                ],
            )

            self.messages.append(
                {
                    "role": "user",
                    "content": f"I sent you a video of my golf swing from {video_path}",
                }
            )
            self.messages.append(res["message"])

            return res["message"]["content"]
        except Exception as e:
            return f"Error processing video: {str(e)}"

    def process_golf_video(self, video_path, frame_interval=10):
        """
        Process a golf swing video by extracting frames

        Args:
            video_path (str): Path to the video file
            frame_interval (int): Extract every Nth frame

        Returns:
            list: List of base64 encoded frames
        """
        print(f"Processing video: {video_path}")

        cap = cv2.VideoCapture(video_path)

        if not cap.isOpened():
            print(f"Error: Could not open video file {video_path}")
            return []

        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = frame_count / fps

        print(
            f"Video FPS: {fps}, Duration: {duration:.2f} seconds, Total frames: {frame_count}"
        )

        frames = []
        frame_number = 0

        while cap.isOpened():
            success, frame = cap.read()

            if not success:
                break

            if frame_number % frame_interval == 0:
                with tempfile.NamedTemporaryFile(
                    suffix=".jpg", delete=False
                ) as temp_file:
                    temp_filename = temp_file.name

                    cv2.imwrite(temp_filename, frame)

                    with open(temp_filename, "rb") as f:
                        image_data = f.read()
                        base64_image = base64.b64encode(image_data).decode("utf-8")
                        frames.append(base64_image)

                    os.unlink(temp_filename)

                print(f"Extracted frame {frame_number} ({len(frames)} frames total)")

            frame_number += 1

        cap.release()

        max_frames = frame_count / 2
        if len(frames) > max_frames:
            selected_frames = []
            step = len(frames) // max_frames
            for i in range(0, len(frames), step):
                if len(selected_frames) < max_frames:
                    selected_frames.append(frames[i])
            frames = selected_frames

        print(f"Selected {len(frames)} frames for analysis")
        return frames

    def handle_conversation(
        self,
    ):
        while True:
            user_input = input("You: ")
            if user_input.lower() == "exit":
                break
            else:
                return f"AI: {self.answer_question(user_input)}"

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
import base64
import cv2
import os
import tempfile


class ChatBot:
    def __init__(self):
        self.system_prompt = """You are a professional golf instructor and caddie here to help golfers. 
                                You give accurate, but short, concise advise when asked a question and only give answers in the context of golf.
                                If asked for more information, provide a detailed response in 250 words. Make sure to say on the topic of golf and do not go off on tangents.
                                Also please respon using markdown format.
                                """
        self.messages = [{"role": "system", "content": self.system_prompt}]

    def answer_question(self, content):
        if content.lower() == "reset":
            return self.handle_reset()

        if content.lower() == "image":
            return self.handle_image()
        elif content.lower() == "video":
            return self.handle_video()
        else:
            self.messages.append({"role": "user", "content": content})
            res = ollama.chat(model="gemma3", messages=self.messages)
            self.messages.append(res["message"])
            return res["message"]["content"]

    def handle_image(self, file_path=None):
        """Handle image analysis for golf swing"""
        if file_path is None:
            image_path = input("Please provide the image path: ")
        else:
            image_path = file_path
        try:
            with open(image_path, "rb") as f:
                image_data = f.read()
                base64_image = base64.b64encode(image_data).decode("utf-8")

            res = ollama.chat(
                model="gemma3",
                messages=[
                    {
                        "role": "user",
                        "content": """You are a professional golf instructor and caddie here to help golfers improve their swing.
                        When shown an image of a golf swing, provide short, concise, and accurate advice specific to what you observe.
                        Your response should focus only on golf swing technique, mechanics, and posture—no off-topic comments.
                        If asked for more detail, give an in-depth explanation in no more than 250 words, strictly within the context of golf swing improvement.
                        Use markdown format in all responses.
                        """,
                        "images": [base64_image],
                    }
                ],
            )

            self.messages.append(
                {
                    "role": "user",
                    "content": f"I sent you an image of my golf swing from {image_path}",
                }
            )
            self.messages.append(res["message"])

            return res["message"]["content"]
        except Exception as e:
            return f"Error processing image: {str(e)}"

    def handle_video(self, file_path=None):
        """Handle video analysis for golf swing"""
        if file_path is None:
            video_path = input("Please provide the video path: ")
        else:
            video_path = file_path

        frame_interval = 10

        try:
            frames = self.process_golf_video(video_path, frame_interval)

            if not frames:
                return "No frames were extracted from the video."

            res = ollama.chat(
                model="gemma3",
                messages=[
                    {
                        "role": "user",
                        "content": """You are a professional golf instructor and caddie here to help golfers improve their swing.
                        When shown images of a golf swing sequence, provide short, concise, and accurate advice specific to what you observe.
                        Your response should focus only on golf swing technique, mechanics, and posture—no off-topic comments.
                        If asked for more detail, give an in-depth explanation in no more than 250 words, strictly within the context of golf swing improvement.
                        Use markdown format in all responses.
                        provide drills for advice you give to the user
                        """,
                        "images": frames,
                    }
                ],
            )

            self.messages.append(
                {
                    "role": "user",
                    "content": f"I sent you a video of my golf swing from {video_path}",
                }
            )
            self.messages.append(res["message"])

            return res["message"]["content"]
        except Exception as e:
            return f"Error processing video: {str(e)}"

    def process_golf_video(self, video_path, frame_interval=10):
        """
        Process a golf swing video by extracting frames

        Args:
            video_path (str): Path to the video file
            frame_interval (int): Extract every Nth frame

        Returns:
            list: List of base64 encoded frames
        """
        print(f"Processing video: {video_path}")

        cap = cv2.VideoCapture(video_path)

        if not cap.isOpened():
            print(f"Error: Could not open video file {video_path}")
            return []

        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = frame_count / fps

        print(
            f"Video FPS: {fps}, Duration: {duration:.2f} seconds, Total frames: {frame_count}"
        )

        frames = []
        frame_number = 0

        while cap.isOpened():
            success, frame = cap.read()

            if not success:
                break

            if frame_number % frame_interval == 0:
                with tempfile.NamedTemporaryFile(
                    suffix=".jpg", delete=False
                ) as temp_file:
                    temp_filename = temp_file.name

                    cv2.imwrite(temp_filename, frame)

                    with open(temp_filename, "rb") as f:
                        image_data = f.read()
                        base64_image = base64.b64encode(image_data).decode("utf-8")
                        frames.append(base64_image)

                    os.unlink(temp_filename)

                print(f"Extracted frame {frame_number} ({len(frames)} frames total)")

            frame_number += 1

        cap.release()

        max_frames = frame_count / 2
        if len(frames) > max_frames:
            selected_frames = []
            step = len(frames) // max_frames
            for i in range(0, len(frames), step):
                if len(selected_frames) < max_frames:
                    selected_frames.append(frames[i])
            frames = selected_frames

        print(f"Selected {len(frames)} frames for analysis")
        return frames

    def handle_conversation(
        self,
    ):
        while True:
            user_input = input("You: ")
            if user_input.lower() == "exit":
                break
            else:
                return f"AI: {self.answer_question(user_input)}"

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
