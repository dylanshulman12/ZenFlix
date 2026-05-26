import json
import sqlite3
import re
import os
import ffmpeg
from PIL import Image
from rapidfuzz import fuzz

config_path = "config.json"

def getConfigSetting(option: str):
    with open(config_path, "r") as f:
        info = json.load(f)
    return info.get(option)



def remuxVideo(file_path: str):
    mp4_path = os.path.splitext(file_path)[0] + ".mp4"

    if not os.path.exists(mp4_path):
        print("fixing codec")

        stream = (
            ffmpeg
            .input(file_path)
            .output(
                mp4_path,
                vcodec="copy",
                acodec="aac",
                audio_bitrate="192k",
                movflags="+faststart",
                threads=0
            )
            .global_args(
                "-map", "0:v:0",
                "-map", "0:a:0"
            )
        )

    try:
        ffmpeg.run(stream, overwrite_output=True)
    except Exception as e:
        raise RuntimeError(f"ffmpeg failed: {e}")

    return mp4_path


def convertToPNG():

    folder = getConfigSetting("metadataPath")
    for filename in os.listdir(folder):
        webp_path = os.path.join(folder, file_name)
        png_path = os.path.join(folder, file_name.replace(".webp", ".png"))

        with Image.open(webp_path) as img:
            img.save(png_path, "PNG")
        print(f"{filename} converted")
        os.remove(webp_path)

