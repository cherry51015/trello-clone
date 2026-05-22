import google.generativeai as genai

from app.core.config import settings

_model = None


def get_model():
    global _model

    if _model is None:
        if not settings.gemini_api_key:
            print("❌ GEMINI_API_KEY missing")
            return None

        try:
            genai.configure(api_key=settings.gemini_api_key)
            _model = genai.GenerativeModel("gemini-2.0-flash")
        except Exception as e:
            print(f"❌ Gemini init failed: {e}")
            return None

    return _model


async def generate_card_description(title: str) -> str:
    model = get_model()

    if not model:
        return ""

    prompt = f"""
Generate a concise and professional Trello card description.

Task:
"{title}"

Requirements:

* 1 to 3 short sentences
* actionable
* professional tone
* no bullet points
"""

    try:
        response = model.generate_content(prompt)
        text = getattr(response, "text", None)

        if not text:
            print("❌ Gemini returned empty response")
            return ""

        return text.strip()
    except Exception as e:
        print(
f"❌ Gemini generation failed: {e}"
)

        if "429" in str(e):
            return (
        "AI description generation is "
        "temporarily unavailable because "
        "the API quota has been exceeded."
    )

        return (
    "AI could not generate a description "
    "right now."
)


