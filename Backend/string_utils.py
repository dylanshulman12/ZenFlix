import re

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