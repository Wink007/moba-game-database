"""
Simple thread-safe in-memory TTL cache for Flask.
No Redis required — works per-process (OK for single Railway instance).
"""
import time
import threading
from functools import wraps
from flask import request, jsonify, make_response

_store: dict = {}
_lock = threading.Lock()


def _make_key(prefix: str) -> str:
    """Build cache key from prefix + all GET query params (sorted for consistency)."""
    params = '&'.join(f'{k}={v}' for k, v in sorted(request.args.items()))
    return f'{prefix}?{params}' if params else prefix


def get(key: str):
    with _lock:
        entry = _store.get(key)
        if entry and time.time() < entry['expires']:
            return entry['data']
        if entry:
            del _store[key]
    return None


def put(key: str, data, ttl: int):
    with _lock:
        _store[key] = {'data': data, 'expires': time.time() + ttl}


def invalidate_prefix(prefix: str):
    """Remove all keys that start with the given prefix."""
    with _lock:
        keys = [k for k in _store if k.startswith(prefix)]
        for k in keys:
            del _store[k]


def cached(prefix: str, ttl: int = 300):
    """
    Decorator for Flask route handlers (GET only).
    Caches the JSON response for `ttl` seconds.
    Cache key = prefix + all query params.

    Usage:
        @app.route('/api/heroes')
        @cached('heroes', ttl=600)
        def get_heroes():
            ...
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            key = _make_key(f'{prefix}:{",".join(str(v) for v in kwargs.values())}' if kwargs else prefix)
            hit = get(key)
            if hit is not None:
                resp = make_response(hit)
                resp.headers['Content-Type'] = 'application/json'
                resp.headers['X-Cache'] = 'HIT'
                resp.headers['Cache-Control'] = f'public, max-age={ttl}'
                return resp

            result = fn(*args, **kwargs)

            # Extract response object and actual HTTP status code.
            # Flask lets routes return (response, status) tuples — the status
            # in the tuple is the real one; response.status_code is always 200
            # until Flask processes the tuple.
            if isinstance(result, tuple):
                response = result[0]
                status = result[1] if len(result) > 1 else 200
            else:
                response = result
                status = getattr(response, 'status_code', 200)

            # Only cache successful responses
            if status == 200:
                data = response.get_data(as_text=True)
                put(key, data, ttl)
                response.headers['X-Cache'] = 'MISS'
                response.headers['Cache-Control'] = f'public, max-age={ttl}'

            return result

        return wrapper
    return decorator
