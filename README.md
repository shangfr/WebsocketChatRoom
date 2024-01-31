# WebsocketChatRoom
FastAPI websocket chat room

```bash
git clone https://github.com/shangfr/WebsocketChatRoom.git
cd WebsocketChatRoom
uvicorn main:app --reload
```

<img src="static\image\screenshot-20240123-152430.png" alt="Image 1" >  
<img src="static\image\screenshot-20240123-152540.png" alt="Image 2" >  

# Create A Tauri-App

```bash
npm install --save-dev @tauri-apps/cli
```

For npm to detect Tauri correctly you need to add it to the "scripts" section in your `package.json` file:
```json
"scripts": {
  "tauri": "tauri"
}
```

```bash
npm run tauri init
npm run tauri dev
```