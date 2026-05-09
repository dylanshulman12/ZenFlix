"use client"

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function fileBrowser ()

{

const [list, setList] = useState<{label: string, path: string, type: string}[]>([])
const [showFilePicker, setShowFilePicker] = useState(false)
const [DIR, setDIR] = useState('/')

const [current, setCurrent] = useState("")
const [movie, setMovie] = useState('')
const [show, setShow] = useState('')
const router = useRouter()


 useEffect(() => {
    async function fetchData() {
              
        const data = await fetch(`http://localhost:8000/api/get/listDIR/${encodeURIComponent(DIR)}`)
        const dataList = await data.json()
        setList(dataList);
        console.log(dataList)
    
    }
        fetchData()
    },[DIR])


    function handleClick(newDIR) {
        setDIR(newDIR)
        console.log(newDIR)
        // setSelectedItem(newDIR)
    }

    function handleSelectionButton(current: string) {
        setCurrent(current)
        setShowFilePicker(true)
    }

    async function handleContinue() {
        const url = `http://localhost:8000/api/generate?tvshow_path=${encodeURIComponent(show)}&movie_path=${encodeURIComponent(movie)}`;

      const response = await fetch(url);
      const data = await response.json();
      console.log("API response:", data);

      // Navigate after fetch completes
      router.push("/Gallery");
    }
    function handleConfirmPathSelection() {
        //write if statments for api call
        setShowFilePicker(false)
        

    
        if (current == "movies") {
            setMovie(DIR)
            console.log(DIR)

        }
        else if (current == "shows") {
            setShow(DIR)
            console.log(DIR)
        }
    
    }

    return (
        <div>

        <div style= {{backgroundColor: 'white', height: '100vh', width: '100vw'}}>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#333', textAlign: 'center'}}>
                Welcome To Zenflix.
            </div>

            {/* Main page flex */}
            <div style={{display: 'flex', flexDirection: 'column', height: '80vh', justifyContent: "space-between", marginTop: '5vh'}}>
            {/* Selector flex */}
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'}}>
            
            <div style={{ display: 'flex', flexDirection: 'row', color: '#333', gap: '10px'}}>
                <div style={{fontSize: '2rem', width: '350px'}}>Select Movies path</div>
                <button style={{border: "1px solid black", background: "orange", width: '100px'}} onClick={() => handleSelectionButton("movies")}>
                    Select
                </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', color: '#333', gap: '10px'}}>
                <div style={{fontSize: '2rem', width: '350px'}}>Select TV Shows path</div>
                <button style={{border: "1px solid black", background: "orange", width: '100px'}} onClick={() => handleSelectionButton("shows")}>
                    Select
                </button>
            </div>
            
            
            </div>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', color: '#333'}}>
                <button style={{border: "1px solid black", background: "orange", width: '300px', height: '50px'}} onClick={() => handleContinue()}>
                    Continue
                </button>
                </div>
        </div>
    </div>

        
        { showFilePicker === true ? (
        <div style={{
            position: 'fixed',
            width: '100vw',        
            height: '100vh',
            background: 'rgba(21, 21, 21, 0.04)',
            top: 0,
            left: 0,


            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
            }}>
                
                <div style={{
                    display: "flex",
                    flexDirection: 'column',
                    flex: '0 0 50%',
                    margin: 'auto',
                    height: '80%',
                    

                    justifyContent: "center",
                    alignItems: "center", 
                }}>
                    <div style={{border: '5px solid black', background: 'white', display: "flex", alignItems: 'flex-start', height: '9%', width: '100%', margin: '0'}}>
                        <button onClick={() => handleClick('/')}>
                            <img
                                src={"Back-Arrow.png"}
                                alt={"Back"}
                                width={70}
                                height={70}
                                style={{ objectFit: 'cover'}}
                                />
                        </button>
                        <div style={{display: 'flex', flexDirection: 'column', lineHeight: '1', padding: '2px'}}>
                            <div style={{fontSize: '2rem', color: 'black'}}>File Selector</div>
                            <div style={{fontSize: '1.5rem', color: 'grey'}}>{DIR}</div>
                        </div>

                    </div>
                    <div style={{
                        border: '5px solid black', 
                        height: '30%',
                        width: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        overflowY: "auto",      
                        
                        }} >

                        {list.map((item,key) => {
                            return (
                                
                                <button 
                                style={{ 
                                    backgroundColor: item.type === "folder" ? "blue" : "lightsalmon",
                                    display: 'flex',
                                    border: '2px solid black', 
                                    padding: '5px', 
                                    justifyContent: "space-between",  // pushes children to opposite ends
                                    margin: '5px'}}
                                    onClick={() => handleClick(item.path)}
                                    >
                                        <div>{item.label}</div>
                                        <div>{item.type}</div>
                                    
                                </button>
                                
                            )
                        })}
                    </div>
                    <div style={{border: '5px solid black', height: '7%', width: '100%'}}>
                            <button style={{border: '2px solid black', margin: '5px', background: 'lightsalmon', alignItems: 'flex-end', padding: '5px', }}onClick={() => handleConfirmPathSelection()}>Confirm</button>
                    </div>

                  </div>
            </div>
           ): (null)}


           
        </div>
    )
}


