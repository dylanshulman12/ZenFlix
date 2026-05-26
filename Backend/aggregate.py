import os
from pathlib import Path
from dotenv import load_dotenv
import requests
from urllib.parse import quote
import sqlite3

from utils import getConfigSetting
from string_utils import extractName, extractEpisode, extractYear


import uuid
import sqlite3


conn = sqlite3.connect('media.db')
cursor = conn.cursor()

cursor.execute("""CREATE TABLE IF NOT EXISTS movies (
movie_id TEXT PRIMARY KEY,
tmdb_id TEXT,

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
runtime INTEGER,
overview TEXT
)
""")
conn.commit()

def insertMovie(tmdb_id, entry, name, collection, path, file_type, release_date, runtime=0, overview=None):
    
    conn = sqlite3.connect('media.db')
    cursor = conn.cursor()

    cursor.execute("""CREATE TABLE IF NOT EXISTS movies (
    movie_id TEXT PRIMARY KEY,
    tmdb_id TEXT,

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
    runtime INTEGER,
    overview TEXT
    )
    """)
    conn.commit()

    movie_id = str(uuid.uuid4())

    # Insert the new movie
    cursor.execute("""
        INSERT INTO movies (
                   
            movie_id,
            tmdb_id,
            
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
            runtime,
            overview
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            movie_id,
            tmdb_id,
            entry,
            name,
            collection,
            path,
            file_type,
            "s",  # actor1 placeholder
            "s",  # actor2 placeholder
            "s",  # actor3 placeholder
            "s",  # director placeholder
            release_date,
            runtime,
            overview
        ))
    conn.commit()
    print(f"Inserted {name} with ID: {movie_id}")
    return True  # Successfully inserted
        
def getMetaData(item):
    
    load_dotenv(dotenv_path="../.env")
    api_key = os.getenv("API_KEY")
    
    os.makedirs("posters", exist_ok=True)

    
    movie_name = item["name"]
    release_date = str(item["release_date"])
    encodedName = quote(movie_name) 


    print("Movie name: " + movie_name)
    print("Release date: " + release_date)
    print("encoded: " + encodedName)

    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    # Grab every poster and download it!
    url = f"https://api.themoviedb.org/3/search/movie?query={encodedName}&include_adult=false&language=en-US&page=1&year={release_date}"
    try:
        response = requests.get(url, headers=headers)
        overview = response.json()["results"][0]["overview"]
        release_date = response.json()["results"][0]["release_date"]
        tmdb_id = response.json()["results"][0]["id"]    
        poster_path = response.json()["results"][0]["poster_path"]
        backdrop_path = response.json()["results"][0]["backdrop_path"]
        
        #get poster and backdrop
        poster_response = requests.get(f"https://image.tmdb.org/t/p/original{poster_path}")
        backdrop_response = requests.get(f"https://image.tmdb.org/t/p/original{backdrop_path}")

        with open(f"./posters/{tmdb_id}.jpg", "wb") as f:
            f.write(poster_response.content)     
        with open(f"./posters/{tmdb_id}-backdrop.jpg", "wb") as f:
            f.write(backdrop_response.content)  
        return {"tmdb_id": tmdb_id, "overview": overview, "release_date": release_date}
    
    except Exception as e:
        print(f"failed to download, error: {e}")

    return

# Scans actual media on device
def scanMedia(type):
    conn = sqlite3.connect('media.db')
    cursor = conn.cursor()
    movies = []
    shows = []
    if type == "shows":
        pass
 
    elif type == "movies": 
        root = Path(getConfigSetting("Movie_Path"))
        for entry in root.iterdir():
            if entry.is_dir(): #This is a collection
                for movie in entry.iterdir():
                    
                    if movie.suffix.lower() in ['.json', '.txt', '.pdf']:
                        continue
                    movies.append({"entry": movie.name, "name": extractName(movie.name), "collection": entry.name, "path": str(movie), "file_type": movie.suffix, "release_date": extractYear(movie.name)})
            else:
                movies.append({"entry": entry.name, "name": extractName(entry.name), "collection": "root", "path": str(entry), "file_type": entry.suffix, "release_date": extractYear(entry.name)})

                


    # Siphon media (is it already in db?)
    new_movies = []

    for movie in movies:
        cursor.execute("SELECT 1 FROM movies WHERE path = ?", (movie["path"], ))
        exists = cursor.fetchone()
    
        if exists:
            pass
        else:
            new_movies.append(movie)
        
           
    #Get metadata
    for movie in new_movies:
        response = getMetaData(movie)
        # ex response {"tmdb_id": tmdb_id, "overview": overview, "release_date": release_date}
        if response is not None:
            insertMovie(response["tmdb_id"], movie['entry'], movie['name'], movie['collection'], movie['path'], movie['file_type'], response['release_date'], overview=response['overview'])
        else: 
            insertMovie("s", movie['entry'], movie['name'], movie['collection'], movie['path'], movie['file_type'], movie['release_date'])
    
        








