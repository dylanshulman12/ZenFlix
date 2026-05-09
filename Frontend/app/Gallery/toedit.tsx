"use client";

import { useState, useEffect, Context, useContext } from "react";

import { Button, ToggleButtonGroup, ToggleButton } from "@mui/material";

//nav
import { useRouter } from "next/navigation";

import { MediaItem } from "../Components/components";

export default function Home() {
  type CollectionGroup = {
    collection: string;
    children: [];
  };

  type mediaListGroup = {
    entry: string;
    path: string;
    collection: string;
    season: string;
  };

  const [loading, setLoading] = useState(true);

  const [toggleTitles, setToggleTitles] = useState(false);
  const [view, setView] = useState("Movies");
  const [toggleOverflowView, setToggleOverflowView] = useState<
    { name: string; toggle: boolean }[]
  >([]);
  const [collections, setCollections] = useState<CollectionGroup[] | null>(
    null,
  );
  const [collectionItems, setCollectionItems] = useState<mediaListGroup[]>([]);

  const [mediaList, setMediaList] = useState<mediaListGroup[]>([]);

  const router = useRouter();

  //API Components
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const data = await fetch(`/api/get/${view}`);
      const list = await data.json();
      setMediaList(list);
      setLoading(false);
    }
    fetchData();
  }, [view]);

  //sort collections
  useEffect(() => {
    var list = [];
    var tempList = [];

    if (mediaList == null) return;
    for (var i = 0; i < mediaList.length; i++) {
      if (!list.some((item) => item.collection === mediaList[i].collection)) {
        for (var d = 0; d < mediaList.length; d++) {
          if (mediaList[d].collection == mediaList[i].collection) {
            tempList.push(mediaList[d]);
          }
        }
        if (mediaList[i].collection != "root") {
          list.push({
            collection: mediaList[i].collection,
            children: tempList,
          });
        }
        tempList = [];
      }
    }
    console.log(list);
    setCollections(list);
  }, [mediaList]);

  const triggerUpdate = async () => {
    const data = await fetch("/api/refresh/");
    alert("Metadata updated!");

    //reload current view
    setLoading(true);
    const currentViewData = await fetch(
      `api/get/${view}`,
    );
    const list = await currentViewData.json();
    setMediaList(list);
    setLoading(false);
  };
  // --------------------------------------------------

  const handleViewChange = (event, newAlignment) => {
    if (newAlignment !== null) {
      setView(newAlignment);
    }
  };

  const handleToggleTitles = () => {
    setToggleTitles((prev) => !prev);
  };

  function handleToggleOverflow(item) {
    // .find returns object
    const index = toggleOverflowView.findIndex(
      (item) => item.name === collection_title,
    );
    const tempList = [...toggleOverflowView]; //You need to create a new list so that react updates state, this is like creating a new box but spread op uses same entries(doesnt copy)
    //const means you cant change variable, but you can still mutate contents

    tempList[index] = {
      ...tempList[index],
      toggle: !toggleOverflowView[index].toggle,
    };

    setToggleOverflowView(tempList);

    return "done";
  }

  function getIndex(collection_title) {
    const index = toggleOverflowView.findIndex(
      (item) => item.name === collection_title,
    );
    return index;
  }

  function triggerOverview(item) {
    if (view == "Movies") {
      router.push(
        `/Overview?item=${encodeURIComponent(JSON.stringify(item))}&view=${encodeURIComponent(
          view,
        )}`,
      );
    } else {
      router.push(
        `/Overview?item=${encodeURIComponent((item))}&view=${encodeURIComponent(
          view,
        )}`,
      );
    }

    return "done";
  }

  function triggerCollectionOverview(items) {
    console.log(items);
    setCollectionItems(items);
    setView("collection");
  }
  //Main page
  return (
    <div
      style={{
        background: "#141414",
        height: "100vh",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          position: "relative",
          background: "#181414",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50px",
        }}
      >
        {/* Top left corner Update metadata button */}
        <Button
          variant="outlined"
          onClick={triggerUpdate}
          style={{
            color: "white",
            position: "absolute",
            top: "1px",
            left: "1px",
          }}
        >
          Update Metadata
        </Button>

        {/* Centered Tabed nav */}
        <div style={{ color: "white" }}>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={handleViewChange}
            aria-label="Platform"
            sx={{
              "& .MuiToggleButton-root": {
                color: "white", // default text color
                "&:hover": {
                  color: "#ff5252", // hover text color
                  backgroundColor: "transparent", // optional: avoid background change
                },
                "&.Mui-selected": {
                  color: "#ffd700", // selected (active) text color
                  backgroundColor: "transparent", // optional: remove selected bg
                },
              },
            }}
          >
            <ToggleButton value="Movies">Movies</ToggleButton>
            <ToggleButton value="Shows">Shows</ToggleButton>
          </ToggleButtonGroup>
        </div>

        <ToggleButton
          value="toggle"
          selected={toggleTitles}
          onChange={handleToggleTitles}
          style={{
            color: "white",
            position: "absolute",
            top: "1px",
            right: "1px",
          }}
        >
          Toggle Titles
        </ToggleButton>
      </div>

      {/* Media Below */}
      {loading == true ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            justifyItems: "center",
          }}
        >
          Loading...
        </div>
      ) : view === "Movies" && mediaList.length > 0 ? (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              justifyItems: "center",
              alignItems: "center",
            }}
          >
            {/* <h1>Collections</h1>
            {collections && (
              <>
                {collections.map((item, key) => (
                  <div key={key}>
                    <button
                      key={key}
                      onClick={() => triggerCollectionOverview(item.children)}
                    >
                      <MediaItem
                        index={key}
                        name={item.collection}
                        toggleTitles={toggleTitles}
                      />
                    </button>
                  </div>
                ))}
              </>
            )} */}

            <h1>Unordered</h1>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                width: "90vw",
              }}
            >
              {mediaList.map((item, key) => {
                if (!item.entry_type) {
                  return (
                    <button key={key} onClick={() => triggerOverview(item)}>
                      <MediaItem
                        index={key}
                        name={item.entry}
                        toggleTitles={toggleTitles}
                      />
                    </button>
                  );
                }
                return null;
              })}
            </div>
          </div>
        </>
      ) : view === "collection" && setCollectionItems.length > 0 ? (
        <div>
          {collectionItems.map((item, key) => {
            return (
              <button key={key} onClick={() => triggerOverview(item)}>
                <MediaItem
                  index={key}
                  name={item.entry}
                  toggleTitles={toggleTitles}
                />
              </button>
            );
          })}
        </div>
      ) : view === "Shows" && mediaList.length > 0 ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            justifyItems: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              width: "90vw",
              border: "3px solid white",
            }}
          >
            {collections ? (
              <>
                {collections?.map((item, key) => {
                  return (
                    <div>
                      <button
                        key={key}
                        onClick={() => triggerOverview(item.collection)}
                      >
                        <MediaItem
                          index={key}
                          name={item.collection}
                          toggleTitles={toggleTitles}
                        />
                      </button>
                    </div>
                  );
                })}
              </>
            ) : null}
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          No media found
        </div>
      )}
    </div>
  );
}
