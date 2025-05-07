"""
╔════════════════════════════════════════════════════════════════════╗
║ Python Script                                                      ║
╠════════════════════════════════════════════════════════════════════╣
║ Author : Brodie Rogers                                             ║
║ Contact : Brodieman500@gmail.com                                   ║
║ Created : 05-06-2025                                               ║
║ Purpose : This is the Ai Swing analysis ollama                     ║
║ Notes : Ollama is the best                                         ║
╚════════════════════════════════════════════════════════════════════╝
"""

import ollama
import base64
import cv2
import os
import tempfile


class ChatBot:
    """
    A golf-focused chatbot using Ollama's Gemma3 model to provide instruction and analysis.

    The chatbot can analyze golf swings from images and videos, as well as respond
    to text queries with golf-specific expertise.
    """

    def __init__(self):
        """Initialize the ChatBot with a golf instructor system prompt."""
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

Make sure to respond in a markdown format, using **bold** for key terms and emojis where appropriate.
                                """
        self.messages = [{"role": "system", "content": self.system_prompt}]

    def answer_question(self, content):
        """
        Process user input and return appropriate response based on the content.

        Args:
            content (str): The user's input message

        Returns:
            str: Response from the chatbot
        """
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
        """
        Process and analyze a golf swing from an image.

        Args:
            file_path (str, optional): Path to the image file. If None, prompts user for input.

        Returns:
            str: Analysis of the golf swing from the image
        """
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
        """
        Process and analyze a golf swing from a video.

        Args:
            file_path (str, optional): Path to the video file. If None, prompts user for input.

        Returns:
            str: Analysis of the golf swing from the video
        """
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
        Process a golf swing video by extracting key frames.

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

    def handle_conversation(self):
        """
        Handle an interactive conversation with the user.

        Returns:
            str: Chatbot's response to user input
        """
        while True:
            user_input = input("You: ")
            if user_input.lower() == "exit":
                break
            else:
                return f"AI: {self.answer_question(user_input)}"

    def handle_reset(self):
        """
        Reset the conversation history.

        Returns:
            str: Confirmation message of reset
        """
        try:
            self.messages = [{"role": "system", "content": self.system_prompt}]
            return "Conversation Reset!"
        except Exception as exc:
            return "Oops, unable to reset converstation."


if __name__ == "__main__":
    bot = ChatBot()
    bot.handle_conversation()
