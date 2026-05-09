


// export function EpisodeItem({ item }) {
//   return (
//     <div>
//       <img
//         src={`Library/Library/Metadata/Posters/${item.entry}.png`}
//         alt={item.entry}
//         width={320}
//         height={180}
//         style={{ border: "2px solid white" }}
//       />
//       {/* <h1>{item.entry}</h1> */}
//     </div>
//   );
// }

// Remember syntax here for types!!!!
export function MediaItem({name, id}: {name: string, id: number}) {
  return (
    <div className="card mediaItem">
    
    <div style={{ display: "flex", flexDirection: "column", gap: "50px" }}>       
        <div style={{minHeight: '150px', maxHeight: '150px', overflow: 'hidden'}}>{name}</div>
        <div>{id}</div>
      </div>
    </div>
  );
}

export function MediaItemPoster({name, id}: {name: string, id: number}) {
  return (
    <div className="card poster">
      <img
        src={`/api/get_poster/${id}`}
        alt={name}
        width={200}
        height={300}
        style={{ objectFit: "cover", borderRadius: '15px'}}
      />
    </div>
  );
}
