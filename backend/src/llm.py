from groq import Groq


class LLMHandler:
    def __init__(self, api_key: str, model_name: str = "llama3-70b-8192"):
        self.client = Groq(api_key=api_key)
        self.model_name = model_name

    def get_answer(self, query: str, context: str) -> str:
        prompt = f"""You are a smart AI assistant for ANKAN Garments retail store.
You help store managers understand sales, stock, inventory, brands, and trends.

Rules:
- Answer ONLY from the data provided below
- If data is insufficient, say "No relevant data found for this query"
- Use markdown tables, bullet points, and bold text for structured answers
- Be concise but complete
- Highlight important numbers and insights

Store Data:
{context}

Question: {query}

Answer clearly and professionally:"""

        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=1024,
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"❌ Groq Error: {str(e)}\n\nPlease check your API key or try again."
