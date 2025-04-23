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
