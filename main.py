# -*- coding: utf-8 -*-
"""
Created on Wed Jan 10 10:43:05 2024

@author: shangfr
"""
import json
from copy import copy
from fastapi import FastAPI, WebSocket, Request
from fastapi import WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

room_list = []


@app.get("/", response_class=HTMLResponse)
async def get(request: Request):
    context = {"request": request}
    return templates.TemplateResponse("index.html", context)


@app.get('/api')
def test_index():

    room_user_map = {}
    # 遍历list中的每个client字典
    for rl in room_list:
        # 获取client字典中的room_id和user_id
        room_id = rl["room_id"]
        user_id = rl["user_id"]

        # 如果room_id不在字典中，添加一个空列表
        if room_id not in room_user_map:
            room_user_map[room_id] = []

        # 将当前的user_id添加到对应room_id的列表中
        room_user_map[room_id].append(user_id)

    return {"detail": "Server is Working", "房间": f"{room_user_map}"}


# Send message to all users
async def broadcast_to_room(message: str, room_id, user_id):
    room_ws = list(filter(
        lambda i: i['room_id'] == room_id and i['user_id'] != user_id, room_list))
    for room in room_ws:
        await room['socket'].send_text(json.dumps({'msg': message, 'roomId': room_ws[0]['room_id']}))


def remove_room(except_room):
    new_room_list = copy(room_list)
    room_list.clear()
    for room in new_room_list:
        if except_room != room['socket']:
            room_list.append(room)
    print("room_list append - ", room_list)


@app.websocket('/ws/{room_id}/{user_id}')
async def websocket_endpoint(websocket: WebSocket, room_id: str, user_id: str):
    try:
        await websocket.accept()
        client = {
            "room_id": room_id,
            "user_id": user_id,
            "socket": websocket
        }
        room_list.append(client)
        print("Connection established")
        while True:
            data = await websocket.receive_text()
            # await websocket.send_text(f"Message text was: {data}")
            await broadcast_to_room(data, room_id, user_id)
    except WebSocketDisconnect as e:
        remove_room(websocket)


## uvicorn main:app --reload