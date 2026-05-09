import os
import json
from pathlib import Path
import re
from dotenv import load_dotenv

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




import sqlite3

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

def getConfigSetting(option: str):
    with open(config_path, "r") as f:
        info = json.load(f)
    return info.get(option)





# gpt generated function to clean up name of file

def extractName(filename: str):
    name = filename

    # remove extension
    name = re.sub(r"\.[a-z0-9]+$", "", name, flags=re.I)

    # remove resolution / encoding junk
    name = re.sub(
        r"\b(480p|720p|1080p|1440p|2160p|4k|x264|x265|h265|hevc|bluray|web[- ]dl|amzn|hdr|sdr|ac3|ddp|esub|dual audio)\b.*",
        "",
        name,
        flags=re.I
    )

    # remove season/episode
    name = re.sub(r"\bS\d{1,2}E\d{1,2}\b", "", name, flags=re.I)

    # remove years (very important)
    name = re.sub(r"\(?\b(19|20)\d{2}\b\)?", "", name)

    # remove leftover brackets/garbage chars
    name = re.sub(r"[\[\]\(\)\-_.]+", " ", name)

    # collapse whitespace
    name = re.sub(r"\s+", " ", name).strip()

    return name

# gpt generated function to extract episode number
def extractEpisode(file_name: str):
    EPISODE_PATTERNS = [
    r"(?i)s\d{1,2}e(?P<ep>\d{1,3})",          # S01E04
    r"(?i)s\d{1,2}ex(?P<ep>\d{1,3})",
    r"(?i)\bep(?:isode)?\s*(?P<ep>\d{1,3})",  # Ep4 / Episode 4
    r"(?i)\be(?P<ep>\d{1,3})\b",              # E4 / E04
    r"(?i)\b\d{1,2}x(?P<ep>\d{1,3})\b",       # 1x04
    ] 


    for pattern in EPISODE_PATTERNS:
        match = re.search(pattern, file_name)
        if match:
            return int(match.group("ep"))
    return 0
# gpt generated function to extract release year

def extractYear(title: str):
    match = re.search(r"(19|20)\d{2}", title)
    return int(match.group()) if match else None
def insertMovie(cursor, entry, name, collection, path, file_type, release_date):

        cursor.execute("""
        INSERT INTO movies (
            entry,
            name,
            collection,
            path,
            file_type,
            
            actor1,
            actor2,
            actor3,
            director,
            release_date,
            runtime
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            entry,
            name,
            collection,
            path,
            file_type,
            #Placeholder values....
            "s",
            "s",
            "s",
            "s",
            release_date,
            10140
        ))
        
def insertShow(cursor, show, season, episode, path, file_name, file_type, runtime):

    
    cursor.execute("""
    INSERT INTO shows (
        show, 
        season,
        episode,
        path,
        file_name,
        file_type,
        runtime
    )
    VALUES (?, ?, ?, ?, ?, ?)
    """, (
        show,
        season,
        episode,
        path,
        file_name,
        file_type,
        runtime,
        
    ))

    conn.commit()


def refreshMetaData(cursor):
    
    load_dotenv(dotenv_path="../.env")
    api_key = os.getenv("API_KEY")
    
    os.makedirs("posters", exist_ok=True)


    cursor.execute("SELECT * FROM movies")
    for row in cursor.fetchall():                
        movie_id = row[0]
        name = row[2]
        encodedName = quote(name) 
        release_date = row[10]

        headers = {
            "accept": "application/json",
            "Authorization": f"Bearer {api_key}"
        }

        # Grab every poster and download it!
        url = f"https://api.themoviedb.org/3/search/movie?query={encodedName}&include_adult=false&language=en-US&page=1&year={release_date}"
        try:
            if not os.path.exists("./posters/{movie_id}.jpg"):
                response = requests.get(url, headers=headers)
                
                
                poster_path = response.json()["results"][0]["poster_path"]
                backdrop_path = response.json()["results"][0]["backdrop_path"]
                poster_response = requests.get(f"https://image.tmdb.org/t/p/original{poster_path}")
                backdrop_response = requests.get(f"https://image.tmdb.org/t/p/original{backdrop_path}")

                with open(f"./posters/{movie_id}.jpg", "wb") as f:
                    f.write(poster_response.content)     
                with open(f"./posters/{movie_id}-backdrop.jpg", "wb") as f:
                    f.write(backdrop_response.content)  
        except Exception as e:
            print(f"failed to download, error: {e}")

    return

def scanMedia(type, cursor):

    if type == "tv_shows":
        root = Path(getConfigSetting("TV_Path"))

        for show in root.iterdir():
            if show.is_dir():
                for season in show.iterdir():
                    if season.is_dir():
                        for episode in season.iterdir():
                            if episode.suffix.lower() in ['.json', '.txt', '.pdf']:
                                continue

                            # Replace this with entry into database.... 
                            print({
                                "show": show.name,
                                "season": season.name,
                                "episode": extractEpisode(episode.name),
                                "path": str(episode),
                                "file_name": episode.name,
                                "file_type": episode.suffix,
                                "runtime": "tbi"
                            })
                    else:
                        if season.suffix.lower() in ['.json', '.txt', '.pdf']:
                            continue
                        print({
                            "show": show.name,
                            "season": 1,
                            "episode": extractEpisode(season.name),
                            "path": str(season),
                            "file_name": season.name,
                            "file_type": season.suffix,
                            "runtime": "tbi"
                        })
 
    elif type == "movies": 
        root = Path(getConfigSetting("Movie_Path"))
        for entry in root.iterdir():
            if entry.is_dir(): #This is a collection
                for movie in entry.iterdir():
                    
                    if movie.suffix.lower() in ['.json', '.txt', '.pdf']:
                        continue
                    #Replace with db entry!!
                    insertMovie(cursor, movie.name, extractName(movie.name), entry.name, str(movie), movie.suffix, extractYear(movie.name))
                    # print({
                    #     "entry": movie.name,
                    #     "collection": entry.name,
                    #     "path": str(movie),
                    #     "filetype": movie.suffix,
                    # })
            else:
                insertMovie(cursor, entry.name, extractName(entry.name), "root", str(entry), entry.suffix, extractYear(entry.name))

                # print({
                #     "entry": entry.name,
                #     "collection": "root",
                #     "path": str(entry),
                #     "filetype": entry.suffix,
                # })


def convertToPNG():

    folder = getConfigSetting("metadataPath")
    for filename in os.listdir(folder):
        webp_path = os.path.join(folder, file_name)
        png_path = os.path.join(folder, file_name.replace(".webp", ".png"))

        with Image.open(webp_path) as img:
            img.save(png_path, "PNG")
        print(f"{filename} converted")
        os.remove(webp_path)

#For checking if usr has seen welcome
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
def generate(
    tvshow_path: str,
    movie_path: str,
):
    

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
    items = []
    try:
        os.remove('media.db')
    except Exception as e:
        print(e)
    conn = sqlite3.connect('media.db')
    cursor = conn.cursor()

    cursor.execute("""CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    entry TEXT NOT NULL,
    name TEXT NOT NULL,
    collection TEXT NOT NULL,
    path TEXT NOT NULL,
    file_type TEXT NOT NULL,

    actor1 TEXT,
    actor2 TEXT,
    actor3 TEXT,
    director TEXT,
    release_date TEXT,
    runtime INTEGER
    )
    """)

    cursor.execute("""CREATE TABLE IF NOT EXISTS shows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    show TEXT NOT NULL,
    entry TEXT NOT NULL,
    season TEXT NOT NULL,
    episode TEXT NOT NULL,
    path TEXT NOT NULL,
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL,
    runtime INTEGER
    )
    """)

    scanMedia("movies", cursor)
    conn.commit()
    refreshMetaData(cursor)


    print("Data Inserted in the table: ")
    # Select all from movies: SELECT * FROM movies
    # Select with a filter
    cursor.execute("SELECT * FROM movies")
    for row in cursor.fetchall():
        print(row)    

        
# 
   
    return {"status": "Metadata Updated!"}


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
                print(str(row) + "\n\n")
                movie_list.append({
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
            return movie_list
        
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
    
    cursor.execute(f"SELECT * FROM movies WHERE id = {movie_id}")
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
async def stream(path: str):
    # If 'path' is relative, it might fail or be insecure. 
    # Ensure it points to your media storage.
    print(path)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Video not found")

    # FileResponse automatically handles "Range" requests (seeking)
    # and setting the Content-Length.
    return FileResponse(
        path, 
        media_type="video/x-matroska", 
        filename=os.path.basename(path) # Optional: suggests a filename for downloads
    )
