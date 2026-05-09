"use client"

import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { MediaItem } from "../Components/components"
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material"


export default function Overview() {
  type mediaListGroup = {
    entry: string
    path: string
    collection: string
    season: string
  }
  

  const [loading, setLoading] = useState(true)
  const [mediaList, setMediaList] = useState<mediaListGroup[]>([])
  const [collections, setCollections] = useState<CollectionGroup[] | null>(
    null
  );
  const [season, setSeason] = useState('')
  const [item, setItem] = useState('')
  
  const router = useRouter()

  const searchParams = useSearchParams()
  const view = searchParams.get("view")
  const itemObject = searchParams.get("item")
  
 

  const handleChange = (event: SelectChangeEvent) => {
    setSeason(event.target.value as string)
    console.log(event.target.value)
  }

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const data = await fetch(`/api/get/${view}`)
      const list = await data.json()
      console.log("Yolo")
      console.log(list)
      setMediaList(list)
      setLoading(false)
      if (view == "Movies") {
        setItem(itemObject ? JSON.parse(itemObject) : null)
      } else {
        setItem(itemObject)
      }
    }
    fetchData()
  }, [view])

  function triggerStream(item) {

      router.push(`/Stream?path=${encodeURIComponent(item)}`)

    return "done"
  }


  


  //if its a movie, we just need to display Done
  //if its a tv show, we take main folder directory, search inside medialist then populate seasons

  return (
    <>
    {loading == false && item != '' ? (
            <div style={{position: 'relative'}}>
                    <div style={{position: "absolute", zIndex: 0, background: 'red', top: '20vh', width: '100%', height: '50vh'}}></div>

                    <div style={{position: 'relative', display: "flex", zIndex: 1, flexDirection:"row", paddingLeft: "30px" }}>
                        {/* Start */}
                            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', border: "1px soid red" }}>
                                <button onClick={() => triggerStream(item.path)}>
                                <img
                                src={`/api/get/${item.entry}.png`}
                                alt={`${item.entry} poster image not found`}
                                width={320} // or your actual width
                                height={750} // or actual height
                                />
                                </button>
                            </div>
                        

                        {/* Spacing */}
                        <div style={{position: 'relative', width: "8vw", height: "90vh"}}></div>

                        {/* Media details */}
                        <div style={{position: 'relative', display: "flex", flexDirection: "column", width: "62vw", height: "90vh"}}>
                            {/* Aligned media information */}
                           
                                <div style={{position: 'relative', top: '20vh'}}>
                                    <b><h1 style={{fontSize: '5em'}}>{item.entry}</h1></b>
                                    <h3 style={{fontSize: '2em'}}>Runtime</h3>
                                    <div style={{height: '18vh'}}></div>
                                </div>
                                <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">Age</InputLabel>
                                <Select
                                  labelId="demo-simple-select-label"
                                  id="demo-simple-select"
                                  value={season}
                                  label="Season"
                                  onChange={(value) => handleChange(value)}
                                >
                                  <MenuItem value={1}>season 1</MenuItem>
                                  <MenuItem value={2}>season 2</MenuItem>
                                  <MenuItem value={3}>season 3</MenuItem>
                                </Select>
                              </FormControl>
                       
                        </div>
                        
                    </div>
                    {/* End main informational div */}
              </div>

          
            ): <div>Loading...</div>
          }
          </>
  )
            


}


//       //API Components
//       useEffect(() => {
//             async function fetchData() {

//                 setLoading(true)

//                 // console.log(view)
//                 // const data = await fetch(`http://localhost:8000/api/get/${view}`)
//                 // console.log("yolo")
//                 // const list = await data.json()
//                 // setMediaList(list)

//                 // console.log("Media list: " + list)
//                 // console.log(mediaList) //Will still be null due to async... Just log list

//                 // if (view == "Shows") {
//                 //     setMediaItem(list.find(tempItem => tempItem.collection_title === item))
//                 //     console.log(list.find(tempItem => tempItem.collection_title === item))

//                 // } else {
//                 //     setMediaItem(list.find(tempItem => tempItem.entry === item))

//                 // }
//                 setLoading(false)

//             }
//           fetchData()
//         }, [])

//     return (

//         // view === "Movies" && mediaList.length > 0 ? (
//         //               {mediaList.map((item, key) => {
//         //                 if (!item.entry_type) {
//         //                   return (
//         //                     <button
//         //                       key={key}
//         //                       onClick={() => triggerOverview(item.entry, "item")}
//         //                     >
//         //                       <MediaItem
//         //                         index={key}
//         //                         name={item.entry}
//         //                         toggleTitles={toggleTitles}
//         //                       />
//         //                     </button>
//         //                   )
//         //                 }
//         //                 }
//         // <div>
//         //     
//         // </div>
//         //   )
//         <div></div>
//     )
// }








// (
//                             <div style={{display: 'flex', width: "30vw", height:"90vh", justifyContent: 'center', alignItems: 'center' }}>
//                                 <button onClick={() => triggerStream(item.path)}>
//                                 <img
//                                 src={`/Library/Library/Metadata/Posters/Metadata/Posters/${item.collection_title}.png`}
//                                 alt={`${item.entry} poster image not found`}
//                                 style={{
//                                     maxWidth: '100%',
//                                     maxHeight: '100%',
//                                 }}
//                                 />
//                                 </button>
//                             </div>
//                         )




//                                 <div style={{position: 'relative', top: '20vh'}}>
//                                     <b><h1 style={{fontSize: '5em'}}>{mediaItem.collection_title}</h1></b>
//                                     <h3 style={{fontSize: '2em'}}>Runtime</h3>
//                                     <div style={{height: '18vh'}}></div>

//                                         <div>
//                                             {mediaItem.entries.map((show, index) => {
//                                                 console.log(show.collection_title)
//                                                     return (
//                                                         <div
//                                                         key={index}
//                                                         style={{
//                                                             display:'flex',
//                                                             flexDirection:'row',
//                                                             overflow:'scroll',
//                                                             gap: '40px'}}>
//                                                             {show.entries.map((item, index) => {
//                                                                 console.log(item.entry)
//                                                                 return (
//                                                                 <button onClick={() => triggerStream(item.relative_directory)}>
//                                                                     <EpisodeItem key={index} item={item}/>
//                                                                 </button>
//                                                                 )
//                                                             })}
//                                                         </div>
//                                                     )
//                                             })}

//                                         </div>