"use client"

import { useState, useEffect, Context, useContext } from "react"
import { Button, ToggleButtonGroup, ToggleButton } from "@mui/material"
import { connectWebSocket } from '../websocket';  // Import
import { useRouter } from "next/navigation"
import { MediaItem, MediaItemPoster } from "../Components/components"
import ProgressBar from "../Components/progressBar";

export default function Home() {

  
  type CollectionGroup = {
    collection: string
    children: []
  }

  type mediaListGroup = {
    entry: string
    name: string
    tmdb_id: number
    path: string
    collection: string
    season: string
  }


  const [loading, setLoading] = useState(true)

  const [toggleTitles, setToggleTitles] = useState(false)
  const [view, setView] = useState("Movies")
  const [toggleOverflowView, setToggleOverflowView] = useState<{ name: string; toggle: boolean }[]>([])
  const [collections, setCollections] = useState<CollectionGroup[] | null>(
    null,
  )
  const [collectionItems, setCollectionItems] = useState<mediaListGroup[]>([])
  const [mediaList, setMediaList] = useState<mediaListGroup[]>([]);

  const router = useRouter()
  
  const [messages, setMessages] = useState<{data: any}[]>([]);  
  
  useEffect(() => {
      const ws = connectWebSocket();
    
      // Store the message handler
      const handleMessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Got data:", data);
      
      // Add to messages list
      setMessages(
        prev => [...prev, {data: data}]
      )
    };
    
    // Listen for messages
    ws.onmessage = handleMessage;
    
  }, []);


  function triggerOverview(id: number) {
    if (view == "Movies") {
      router.push(
        `/Overview?item=${encodeURIComponent(JSON.stringify(id))}&view=${encodeURIComponent(
          view,
        )}`,
      );
    } else {
      router.push(
        `/Overview?item=${encodeURIComponent((id))}&view=${encodeURIComponent(
          view,
        )}`,
      );
    }

    return "done";
  }

  //has to be uppercase
  function DisplayMovies() {
      
      if (mediaList == null) return;
      // Display all movies!!!!

      if (toggleTitles == true){

        return (
          <div
            className= "movieGrid">
            {mediaList.map((item, key) => {
              return(
                  <button key={key} onClick={() => triggerOverview(item.id)}>
                    <MediaItem
                      name={item.name}
                      id={item.tmdb_id}
                    />
                  </button>
              )
      
            })}
          </div>
        )
      } else {
        return(
        <div
            className= "movieGrid">
            {mediaList.map((item, key) => {
              return(
                  <button key={key} onClick={() => triggerOverview(item.id)}>
                    <MediaItemPoster
                      name={item.name}
                      id={item.tmdb_id}
                    />
                  </button>
              )
      
            })}
          </div>
        )
      }
        

}


  

  //API Components
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const data = await fetch(`/api/get/${view}`)
      const list = await data.json()
          
      setMediaList(list)
      setLoading(false)
    }
    fetchData()
  }, [view])



  const triggerUpdate = async () => {
    const data = await fetch("/api/refresh/")
    alert("Metadata updated!")

    //reload current view
    setLoading(true)
    const currentViewData = await fetch(`/api/get/${view}`,)
    const list = await currentViewData.json()
    setMediaList(list)
    setLoading(false)

  }
  // --------------------------------------------------

  const handleViewChange = (event, newAlignment) => {
    if (newAlignment !== null) {
      setView(newAlignment)
    }
  }

  const handleToggleTitles = () => {
    setToggleTitles((prev) => !prev)
  }

  function handleToggleOverflow(item) {
    // .find returns object
    const index = toggleOverflowView.findIndex(
      (item) => item.name === collection_title,
    )
    const tempList = [...toggleOverflowView] //You need to create a new list so that react updates state, this is like creating a new box but spread op uses same entries(doesnt copy)
    //const means you cant change variable, but you can still mutate contents

    tempList[index] = {
      ...tempList[index],
      toggle: !toggleOverflowView[index].toggle,
    }

    setToggleOverflowView(tempList)

    return "done"
  }

  function getIndex(collection_title) {
    const index = toggleOverflowView.findIndex(
      (item) => item.name === collection_title,
    )
    return index
  }

  // function toggleTitles(item) {
  //   if (view == "Movies") {
  //     router.push(
  //       `/Overview?item=${encodeURIComponent(JSON.stringify(item))}&view=${encodeURIComponent(
  //         view,
  //       )}`,
  //     )
  //   } else {
  //     router.push(
  //       `/Overview?item=${encodeURIComponent((item))}&view=${encodeURIComponent(
  //         view,
  //       )}`,
  //     )
  //   }

  //   return "done"
  // }

  function triggerCollectionOverview(items) {
    setCollectionItems(items)
    setView("collection")
  }

  //Main page
  return (
    <div className="app">
      {/* Top bar */}
      <div className="topBar">

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

      <ProgressBar messages={messages}/>
      {/* Media Below */}
      <DisplayMovies/>

      </div>
  )
}
