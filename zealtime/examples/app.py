"""
This is a simple example of how to use zealtime with websockets
It checks every 0.5 seconds if the file hello.txt exists
You need to install the dependencies with `pip install websockets`
You can run it with `python3 app.py`
"""

import asyncio
import websockets
import os
import json

connected_clients = set()
CHECK_INTERVAL = 0.5
FILENAME = "hello.txt"
COUNTING = 0

async def notify_clients(data: str):
    message = json.dumps(data)
    if connected_clients:
        await asyncio.gather(*(client.send(message) for client in connected_clients))

async def check_file_presence():
    global COUNTING

    while True:
        if not os.path.exists(FILENAME):
            await notify_clients({
                "z": "set",
                "variables": {
                    "statusColor": "red",
                    "statusText": "Offline"
                }
            })
        else:
            await notify_clients({
                "z": "set",
                "variables": {
                    "statusColor": "green",
                    "statusText": "Online"
                }
            })
        await asyncio.sleep(CHECK_INTERVAL)
        COUNTING += 1

        await notify_clients({
            "z": "set",
            "variables": {
                "counting": COUNTING
            }
        })

async def handler(websocket):
    print("New client connected")
    connected_clients.add(websocket)
    try:
        await websocket.wait_closed()
    finally:
        connected_clients.remove(websocket)

async def main():
    server = await websockets.serve(handler, "0.0.0.0", 8765)
    print("WebSocket server started on ws://0.0.0.0:8765")
    await check_file_presence() 

async def start():
    await asyncio.gather(
        main()
    )

if __name__ == "__main__":
    asyncio.run(start())
