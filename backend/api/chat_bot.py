from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

# Load the base model with correct dtype
base_model = AutoModelForCausalLM.from_pretrained(
    "unsloth/mistral-7b-bnb-4bit",
    torch_dtype=torch.float16,  # or torch.bfloat16 depending on your hardware
    device_map="auto",
)

# Load your fine-tuned adapter
model = PeftModel.from_pretrained(base_model, "eidorb90/Woody.AI")

# Load the tokenizer
tokenizer = AutoTokenizer.from_pretrained("unsloth/mistral-7b-bnb-4bit")

# Set the model to evaluation mode
model.eval()


# Example of generating text
def generate_text(prompt, max_length=500):
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    outputs = model.generate(
        **inputs,
        max_length=max_length,
        temperature=0.7,
        top_p=0.9,
        num_return_sequences=1,
        do_sample=True,
    )
    return tokenizer.decode(outputs[0], skip_special_tokens=True)
