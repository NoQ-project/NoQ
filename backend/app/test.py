from app.config.redis_client import redis_client

keys = redis_client.keys("*")

print("Keys:", keys)

for key in keys:
    print(
        key,
        "TTL:",
        redis_client.ttl(key),
        "VALUE:",
        redis_client.get(key)
    )