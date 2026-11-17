import { useEffect, useState } from 'react';
import { EXERCISE_MEDIA } from '../exerciseMedia';

export default function ExerciseDemo({name,customUrl}) {
  const [open,setOpen]=useState(false);
  const [failed,setFailed]=useState(false);
  const media=EXERCISE_MEDIA[name];
  const url=customUrl || media?.url;
  useEffect(()=>{setOpen(false);setFailed(false);},[url]);
  if(!url) return null;
  return <div className="text-sm"><button type="button" onClick={()=>setOpen(!open)} aria-expanded={open} className="py-2 font-semibold text-emerald-700 dark:text-emerald-400">{open?'Ocultar demostración':'▷ Ver demostración'}</button>
    {open&&<figure className="mt-2 rounded-xl border border-slate-200 bg-white p-3 text-slate-700">
      {failed?<p>No pudimos cargar la demostración.{media&&<a className="ml-2 underline" href={media.source} target="_blank" rel="noreferrer">Ver fuente</a>}</p>:/\.(mp4|webm)(\?|$)/i.test(url)?<video controls playsInline preload="metadata" src={url} onError={()=>setFailed(true)} className="mx-auto max-h-64 max-w-full"/>:<img src={url} alt={`Demostración de ${name}`} loading="lazy" onError={()=>setFailed(true)} className="mx-auto max-h-64 max-w-full object-contain"/>}
      {!customUrl&&media&&<figcaption className="mt-2 text-xs">{media.author} · <a href={media.source} target="_blank" rel="noreferrer" className="underline">Wikimedia Commons</a> · <a href={media.licenseUrl} target="_blank" rel="noreferrer" className="underline">{media.license}</a> · Sin modificaciones.</figcaption>}
    </figure>}
  </div>;
}
