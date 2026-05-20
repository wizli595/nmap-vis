import asyncio
from collections import defaultdict
from collections.abc import AsyncIterator
from typing import Any

from logger import get_logger

log = get_logger("event_bus")


class EventBus:
    def __init__(self):
        self._subscribers: dict[str, list[asyncio.Queue]] = defaultdict(list)

    def subscribe(self, channel: str) -> asyncio.Queue:
        queue: asyncio.Queue = asyncio.Queue()
        self._subscribers[channel].append(queue)
        log.debug(f"New subscriber on '{channel}' (total: {len(self._subscribers[channel])})")
        return queue

    def unsubscribe(self, channel: str, queue: asyncio.Queue) -> None:
        subscribers = self._subscribers.get(channel, [])
        if queue in subscribers:
            subscribers.remove(queue)
        if not subscribers:
            self._subscribers.pop(channel, None)

    async def publish(self, channel: str, message: Any) -> None:
        subscribers = self._subscribers.get(channel, [])
        for queue in subscribers:
            await queue.put(message)

    async def listen(self, channel: str) -> AsyncIterator[Any]:
        queue = self.subscribe(channel)
        try:
            while True:
                message = await queue.get()
                if message is None:
                    break
                yield message
        finally:
            self.unsubscribe(channel, queue)

    async def close_channel(self, channel: str) -> None:
        await self.publish(channel, None)


event_bus = EventBus()
