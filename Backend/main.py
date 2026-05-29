import os
import tempfile
import json
import re
from pathlib import Path

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from PIL import Image
import requests
from urllib.parse import quote
import ffmpeg
from fastapi.staticfiles import StaticFiles
import asyncio
from contextlib import asynccontextmanager

from rapidfuzz import fuzz
import sqlite3

from aggregate import *
from utils import config_path, remuxVideo, getConfigSetting
from string_utils import extractName, extractEpisode, extractYear

import uuid
from fastapi import WebSocket, WebSocketDisconnect
import asyncio
from concurrent.futures import ThreadPoolExecutor


app = FastAPI()
os.makedirs("video", exist_ok=True)
app.mount("/video", StaticFiles(directory="video"), name="video")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://192.168.7.206:3000"],  # React app origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    
)

config_path = "config.json"

#Welcome screen ----------------------
@app.get("/api/welcomeCheck")
def welcomeCheck():
    return os.path.exists(config_path)   


# For file picker
@app.get("/api/get/listDIR/{DIR:path}")
def listDirectory(DIR):
    print("DIR is " + DIR)
    list = []
    for entry in os.listdir(DIR):
        entry = Path(DIR) / entry
        print(f"{entry} : is dir? {entry.is_dir()}")
        if entry.is_dir() and entry.name not in [
                "proc", "sys", "dev", "run",
                "boot", "efi",
                "bin", "sbin",
                "lib", "lib64",
                "usr", "etc", "root",
                "tmp", "lost+found", 
                "srv", "opt", "var"
            ]:
            list.append({ "label": entry.name, "path": str(entry), "type": 'Folder'})
        elif entry.name.startswith('.'):
            pass
    
    return list


# Generate config
@app.get("/api/generate")
def generate(tvshow_path: str, movie_path: str):

    info = {
        "Movie_Path": movie_path,
        "TV_Path": tvshow_path,
    }

    (Path.home() / "library" / "metadata").mkdir(parents=True, exist_ok=True)

    with open(config_path, "w") as f:
        json.dump(info, f, indent=2)

    refresh()

    return {"status": "done"}



# Refresh Metadata

@app.get("/api/refresh/")
def refresh():    

    scanMedia("movies")   
    return {"status": "Metadata Updated!"}

refresh()

# Get full view
@app.get("/api/get/{view}")
def getListData(view: str):
    conn = sqlite3.connect('media.db')
    cursor = conn.cursor()  
    
    match view:
        case "Movies":
            movie_list = []
            cursor.execute("SELECT * FROM movies")
            for row in cursor.fetchall():
                movie_list.append({
                    "movie_id": row[0],
                    "tmdb_id": row[1],
                    "entry": row[2],
                    "name": row[3],
                    "collection": row[4],
                    "path": row[5],
                    "file_type": row[6],
                    "actor1": row[7],
                    "actor2": row[8],
                    "actor3": row[9],
                    "director": row[10],
                    "release_date": row[11],
                    "runtime": row[12],
                    "overview": row[13]

                })
            return movie_list\

# websocket/conversion....

def blocking_ffmpeg(file_path):
    import time
    time.sleep(3)
    return f"converted_{file_path}"

@app.websocket("/api/socket")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Client connected!")
    
    for i in range(45):
        await websocket.send_json({"progress": f"Test message {i}"})
        await asyncio.sleep(1)

    # Add search db which finds anything that is not an mp4, then creates a task for each and starts conversion. Sending websocket alert for each one found, started and completed.
    
    


@app.get("/api/get_poster/{id}")
async def getPoster(id: int):
    # Change to ffmpeg later to ensure that you are serving the appropriate quality image/format

    image_path = Path(f"./posters/{id}.jpg")
    if not image_path.is_file():
        return {"error": "Image not found on the server"}
    return FileResponse(image_path)

@app.get("/api/get_backdrop/{id}")
async def getPoster(id: int):
    # Change to ffmpeg later to ensure that you are serving the appropriate quality image/format

    image_path = Path(f"./posters/{id}-backdrop.jpg")
    if not image_path.is_file():
        return {"error": "Image not found on the server"}
    return FileResponse(image_path)


@app.get("/api/get_data/{movie_id}")
def getData(movie_id):

    conn = sqlite3.connect('media.db')
    cursor = conn.cursor()  
    
    cursor.execute(f"SELECT * FROM movies WHERE movie_id = {movie_id}")
    for row in cursor.fetchall():
        return ({
                    "id": row[0],
                    "entry": row[1],
                    "name": row[2],
                    "collection": row[3],
                    "path": row[4],
                    "file_type": row[5],
                    "actor1": row[6],
                    "actor2": row[7],
                    "actor3": row[8],
                    "director": row[9],
                    "release_date": row[10],
                    "runtime": row[11],
                    })
    return {"Error not found"}


@app.get("/api/stream")
def stream(file_path: str):
    mp4_path = remuxVideo(file_path)

    return FileResponse(
        mp4_path,
        media_type="video/mp4",
        filename=os.path.basename(mp4_path)
    )

# To do: Please delete or hide converted mkv videos beacuse they dup in the list
# Fix metadata, should give a loading symbol as it seems to just take a long time from a ui standpoint
# Fix metadata search, should be more efficient
# convert function to websocket so we can tell the frontend what is happening

