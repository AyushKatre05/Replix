from google import genai
import os
import logging
import json
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Get configurations from environment
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")  # Default model fallback
LOG_DIR = os.getenv("LOG_DIR", "logs")
CACHE_FILE = "llm_cache.json"

# Setup logging directory
os.makedirs(LOG_DIR, exist_ok=True)
log_file = os.path.join(LOG_DIR, f"llm_calls_{datetime.now().strftime('%Y%m%d')}.log")

# Setup logger
logger = logging.getLogger("llm_logger")
logger.setLevel(logging.INFO)
logger.propagate = False

if not logger.handlers:
    file_handler = logging.FileHandler(log_file, encoding='utf-8')
    file_handler.setFormatter(logging.Formatter("%(asctime)s - %(levelname)s - %(message)s"))
    logger.addHandler(file_handler)

def call_llm(prompt: str, use_cache: bool = True) -> str:
    logger.info(f"PROMPT: {prompt}")

    # Load cache if enabled
    cache = {}
    if use_cache and os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                cache = json.load(f)
        except Exception:
            logger.warning("Failed to load cache, starting fresh.")

        if prompt in cache:
            logger.info(f"RESPONSE (from cache): {cache[prompt]}")
            return cache[prompt]

    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY not found in environment variables.")

    client = genai.Client(api_key=GEMINI_API_KEY)
    response = client.models.generate_content(model=GEMINI_MODEL, contents=[prompt])
    response_text = response.text

    logger.info(f"RESPONSE: {response_text}")

    # Save to cache
    if use_cache:
        cache[prompt] = response_text
        try:
            with open(CACHE_FILE, "w", encoding="utf-8") as f:
                json.dump(cache, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.error(f"Failed to save cache: {e}")

    return response_text

if __name__ == "__main__":
    test_prompt = "Hello, how are you?"
    print("Making call...")
    response = call_llm(test_prompt, use_cache=False)
    print(f"Response: {response}")
