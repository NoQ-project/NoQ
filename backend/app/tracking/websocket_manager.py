from collections import defaultdict
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.connections = defaultdict(set)
    async def connect(
        self,
        token_id: int,
        websocket: WebSocket
    ):
        await websocket.accept()
        self.connections[token_id].add(websocket)

    def disconnect(
        self,
        token_id: int,
        websocket: WebSocket
    ):
        self.connections[token_id].discard(websocket)

        if not self.connections[token_id]:
            del self.connections[token_id]

    async def broadcast(
        self,
        token_id: int,
        data: dict
    ):
        disconnected = []

        for websocket in self.connections.get(token_id, set()):
            try:
                await websocket.send_json(data)
            except Exception:
                disconnected.append(websocket)

        for websocket in disconnected:
            self.disconnect(
                token_id,
                websocket
            )

manager = ConnectionManager()