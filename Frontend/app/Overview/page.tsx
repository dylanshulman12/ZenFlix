"use client"

import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { MediaItem } from "../Components/components"
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material"
import { Button, ToggleButtonGroup, ToggleButton } from "@mui/material"


export default function Overview() {
  type mediaListGroup = {
    entry: string
    path: string
    collection: string
    season: string
  }
  

  const [loading, setLoading] = useState(true)
  const [media, setMedia] = useState() //make sure to specify types

  const router = useRouter()

  const searchParams = useSearchParams()
  const view = searchParams.get("view")
  const movie_id = searchParams.get("item")
  


  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const data = await fetch(`/api/get_data/${movie_id}`)
      const media = await data.json()   
      console.log(media)   
      setMedia(media)
      setLoading(false)
 
    }
    fetchData()
  }, [view])


  const handleViewChange = (event, newAlignment) => {
    return
  }
  function triggerStream(item) {

      router.push(`/Stream?path=${encodeURIComponent(item)}`)

    return "done"
  }


  //to implement
  function DisplaySeasons() {
    return 
  }

  function DisplayMediaData() {
    const secondsToMinutes = (seconds: number) => Math.floor(seconds / 60);
    return (
      <div style={{display: "flex", flexDirection: "column"}}> 
        <div style={{fontSize: "70px"}}>{media.name}</div>
        {/* <div style={{fontSize: "30px"}}>{media.director}</div> */}
        <div style={{fontSize: "30px"}}>"by some director" {media.release_date}</div>
        <div style={{fontSize: "30px"}}>
          Runtime: {`${Math.floor(media.runtime / 3600)}:${Math.floor((media.runtime % 3600) / 60)
          .toString()
          .padStart(2, "0")}:${(media.runtime % 60).toString().padStart(2, "0")}`}
        </div>
      </div>
      
    )
  }

  

  
  return (
    <>
    
      {/* Top bar */}
      <div className="topBar overviewBar">
        <div style={{ color: "white", position: 'relative', zIndex: 2,}}>
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
        </div>
        <>
      {loading == false? (
      <div style={{position: 'relative'}}>
        

        <div style={{
          position: "absolute",
          zIndex: 0,
          backgroundImage: `url(/api/get_backdrop/${media.id})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          width: "100%",
          height: "80vh",
        }}>

        </div>


        {/* Gradient! */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.95) 100%)",
          }}
        />

        <div style={{position: 'relative', display: "flex", zIndex: 2, flexDirection: "row"}}>
            {/* Start */}
                <div style={{display: 'flex', paddingLeft: '30px', paddingTop: '100px', justifyContent: 'center'}}>
                    <button onClick={() => triggerStream(media.id)}>
                    <div className="cardlarge poster">
                      <img
                        src={`/api/get_poster/${media.id}`}
                        alt={media.name}
                        width={300}
                        height={450}
                        style={{ objectFit: "cover", borderRadius: '15px'}}
                      />
                    </div>
                  </button>
                  <div style={{paddingLeft: '50px', paddingTop: '30px'}}>
                    <DisplayMediaData/>
                  </div>
                </div>
            

        </div>
      </div>
          
      ): <div>Loading...</div>
    }</>
        </>
  )
}


            

