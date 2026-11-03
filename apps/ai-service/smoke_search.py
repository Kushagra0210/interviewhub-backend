"""Optional live embeddings + embedded Qdrant smoke test. No production data."""
import asyncio
import os
import secrets
import tempfile

os.environ.setdefault('AI_SERVICE_TOKEN', secrets.token_hex(32))
import main
from qdrant_client import AsyncQdrantClient


async def run():
    with tempfile.TemporaryDirectory() as directory:
        main.vector_client = lambda: AsyncQdrantClient(path=directory)
        questions = [
            ('000000000000000000000001', 'Sliding window: maintain a contiguous moving range of array elements to find the longest substring without repeated characters.'),
            ('000000000000000000000002', 'Explain TLS certificate verification, encryption and trust chains in HTTPS.'),
            ('000000000000000000000003', 'Compare precision and recall in an imbalanced classification dataset.'),
        ]
        for id, text in questions:
            await main.index(main.IndexQuestion(id=id, text=text, metadata={'status': 'published', 'difficulty': 'Easy'}))
        result = await main.search(main.Search(query='Find problems involving maintaining a moving range of elements', filters={'status': 'published'}, limit=3))
        assert result['ids'][0] == questions[0][0], result
        await main.index(main.IndexQuestion(id=questions[0][0], text='', metadata={}, deleted=True))
        after = await main.search(main.Search(query='moving range', filters={'status': 'published'}, limit=3))
        assert questions[0][0] not in after['ids']
        print('PASS: real Ollama embeddings, paraphrase ranking and deletion with embedded Qdrant')


if __name__ == '__main__':
    asyncio.run(run())
