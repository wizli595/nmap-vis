import asyncio

import pytest

from store.event_bus import EventBus


@pytest.fixture
def bus():
    return EventBus()


class TestSubscribe:
    def test_subscribe_returns_queue(self, bus):
        queue = bus.subscribe("scan-1")
        assert isinstance(queue, asyncio.Queue)

    def test_multiple_subscribers(self, bus):
        q1 = bus.subscribe("scan-1")
        q2 = bus.subscribe("scan-1")
        assert q1 is not q2


class TestPublish:
    @pytest.mark.anyio
    async def test_publish_reaches_subscriber(self, bus):
        queue = bus.subscribe("scan-1")
        await bus.publish("scan-1", {"type": "output", "line": "hello"})
        message = await queue.get()
        assert message["line"] == "hello"

    @pytest.mark.anyio
    async def test_publish_reaches_all_subscribers(self, bus):
        q1 = bus.subscribe("scan-1")
        q2 = bus.subscribe("scan-1")
        await bus.publish("scan-1", {"type": "test"})
        assert (await q1.get())["type"] == "test"
        assert (await q2.get())["type"] == "test"

    @pytest.mark.anyio
    async def test_publish_to_wrong_channel(self, bus):
        queue = bus.subscribe("scan-1")
        await bus.publish("scan-2", {"type": "test"})
        assert queue.empty()


class TestUnsubscribe:
    @pytest.mark.anyio
    async def test_unsubscribe_stops_messages(self, bus):
        queue = bus.subscribe("scan-1")
        bus.unsubscribe("scan-1", queue)
        await bus.publish("scan-1", {"type": "test"})
        assert queue.empty()


class TestListen:
    @pytest.mark.anyio
    async def test_listen_yields_messages(self, bus):
        received = []

        async def listener():
            async for msg in bus.listen("scan-1"):
                received.append(msg)

        task = asyncio.create_task(listener())
        await asyncio.sleep(0)
        await bus.publish("scan-1", "msg-1")
        await bus.publish("scan-1", "msg-2")
        await bus.close_channel("scan-1")
        await task

        assert received == ["msg-1", "msg-2"]

    @pytest.mark.anyio
    async def test_close_channel_ends_listen(self, bus):
        received = []

        async def listener():
            async for msg in bus.listen("scan-1"):
                received.append(msg)

        task = asyncio.create_task(listener())
        await asyncio.sleep(0)
        await bus.close_channel("scan-1")
        await task

        assert received == []
