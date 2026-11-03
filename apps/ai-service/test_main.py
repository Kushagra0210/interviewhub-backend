import os
os.environ['AI_SERVICE_TOKEN'] = 'test-service-token-with-at-least-32-characters'
import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError
from main import app, Report, Context
import asyncio
import httpx
import main


def test_health_and_auth():
    client = TestClient(app)
    assert client.get('/health').status_code == 200
    assert client.post('/turn', headers={'Authorization': 'Bearer wrong'}, json={}).status_code == 401


def test_report_rejects_out_of_range_scores():
    with pytest.raises(ValidationError):
        Report(overallScore=101, technicalCorrectness=80, reasoning=70, communication=60, strengths=[], weaknesses=[], recommendations=[], questionEvaluations=[])


def test_context_bounds():
    with pytest.raises(ValidationError):
        Context(role='Backend', difficulty='Impossible', type='DSA', topics=[], turns=[])


def provider(monkeypatch, handler):
    original = httpx.AsyncClient
    monkeypatch.setattr(main.httpx, 'AsyncClient', lambda **kwargs: original(transport=httpx.MockTransport(handler), **kwargs))


def context():
    return Context(role='Backend Engineer', difficulty='Easy', type='DSA', topics=['hash tables'], turns=[])


def test_real_provider_interface_and_untrusted_context(monkeypatch):
    def handler(request):
        import json
        payload = json.loads(request.content)
        assert payload['format']['properties']['question']
        assert 'untrusted' in payload['messages'][0]['content']
        return httpx.Response(200, json={'message': {'content': '{"question":"Explain collisions", "topic":"DSA", "feedback":""}'}})
    provider(monkeypatch, handler)
    result = asyncio.run(main.turn(context()))
    assert result['question'] == 'Explain collisions'
    assert result['promptVersion'] == 'interviewer-v1'


@pytest.mark.parametrize('failure', ['timeout', 'invalid', 'status'])
def test_provider_failures_never_fabricate_feedback(monkeypatch, failure):
    calls = []
    def handler(request):
        calls.append(request)
        if failure == 'timeout':
            raise httpx.ReadTimeout('timeout')
        if failure == 'status':
            return httpx.Response(503)
        return httpx.Response(200, json={'message': {'content': 'not json'}})
    provider(monkeypatch, handler)
    with pytest.raises(main.HTTPException) as error:
        asyncio.run(main.turn(context()))
    assert error.value.status_code == 503
    assert len(calls) == 2


def test_embedding_dimension_guard(monkeypatch):
    provider(monkeypatch, lambda _: httpx.Response(200, json={'embeddings': [[0.1, 0.2]]}))
    with pytest.raises(main.HTTPException):
        asyncio.run(main.embed(['moving range']))


def test_evaluation_uses_weighted_rubric(monkeypatch):
    import json
    report = dict(overallScore=99, technicalCorrectness=80, reasoning=60, communication=50, strengths=[], weaknesses=[], recommendations=[], questionEvaluations=[])
    provider(monkeypatch, lambda _: httpx.Response(200, json={'message': {'content': json.dumps(report)}}))
    c = context()
    c.turns = [main.Turn(question='Explain collisions', topic='DSA', answer='Chaining stores several keys in one bucket.')]
    result = asyncio.run(main.evaluate(c))
    assert result['report']['overallScore'] == 68
