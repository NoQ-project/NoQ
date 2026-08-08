from fastapi import WebSocket


class NotificationConnectionManager:

    def __init__(self):
        self.connections: dict[
            int,
            set[WebSocket],
        ] = {}

    async def connect(
        self,
        user_id: int,
        websocket: WebSocket,
    ):
        await websocket.accept()

        if user_id not in self.connections:
            self.connections[user_id] = set()

        self.connections[user_id].add(websocket)

    def disconnect(
        self,
        user_id: int,
        websocket: WebSocket,
    ):
        connections = self.connections.get(user_id)

        if not connections:
            return

        connections.discard(websocket)

        if not connections:
            self.connections.pop(user_id, None)

    async def broadcast(
        self,
        user_id: int,
        data: dict,
    ):
        connections = self.connections.get(user_id)

        if not connections:
            return

        disconnected = []

        for websocket in connections.copy():
            try:
                await websocket.send_json(data)
            except Exception:
                disconnected.append(websocket)

        for websocket in disconnected:
            self.disconnect(
                user_id=user_id,
                websocket=websocket,
            )


notification_manager = NotificationConnectionManager()