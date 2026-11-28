import React from 'react'
import { createRoot } from 'react-dom/client'
import { Avatar } from '../../src/avatar/Avatar'
import '../../src/index.css'
import './style.css'

const faces = ['oval', 'round', 'long', 'square', 'heart', 'wide']
const ears = ['small', 'medium', 'big']
const hairs = ['hair_short', 'hair_straight_long', 'hair_afro', 'hair_headscarf']
const hats = ['', 'hat_cap_red', 'hat_pom_purple', 'hat_cowboy_brown']
const label = (s: string) => s || 'şapkasız'
const params = new URLSearchParams(location.search)
const section = params.get('section') || '1'
const size = Number(params.get('size') || (section === 'mirror' ? 250 : section === '3' || section === '4' ? 90 : 70))
const box = (face: string, ear: string, hair: string, hat: string) => ({
  fshape: `fshape_${face}`, ears: `ears_${ear}`, hair,
  ...(hat ? { hat } : {}),
})

function Factorial() {
  const combos = faces.flatMap(face => ears.flatMap(ear => hairs.flatMap(hair => hats.map(hat => ({face,ear,hair,hat})))) )
  React.useEffect(() => {
    let cancelled = false
    const run = async () => {
      const imgs = [...document.querySelectorAll<HTMLImageElement>('.tile img.av-kid')]
      if (imgs.length < combos.length || imgs.some(im => !im.complete || !im.naturalWidth)) { window.setTimeout(run, 300); return }
      const decode = (im: HTMLImageElement) => createImageBitmap(im)
      let changed = 0, comparisons = 0
      for (let i=0;i<combos.length;i++) {
        const c=combos[i]; if (c.hat) continue
        const base=await decode(imgs[i])
        for (const hat of hats.slice(1)) {
          const j=combos.findIndex(x=>x.face===c.face&&x.ear===c.ear&&x.hair===c.hair&&x.hat===hat)
          const other=await decode(imgs[j]); const n=Math.min(base.width,base.height,other.width,other.height)
          const a=document.createElement('canvas');a.width=a.height=n;const x=a.getContext('2d',{willReadFrequently:true})!
          x.drawImage(base,0,0,n,n);const d1=x.getImageData(n*.25,n*.36,n*.5,n*.35).data
          x.clearRect(0,0,n,n);x.drawImage(other,0,0,n,n);const d2=x.getImageData(n*.25,n*.36,n*.5,n*.35).data
          let diff=0;for(let k=0;k<d1.length;k++)if(d1[k]!==d2[k])diff++
          if(diff)changed++;comparisons++;other.close()
        }
        base.close()
      }
      if(!cancelled){const result=document.getElementById('invariant')!;result.textContent=`Yüz piksel kontrolü: ${comparisons-changed}/${comparisons} aynı`;result.dataset.pass=String(changed===0)}
    }
    void run();return()=>{cancelled=true}
  },[])
  return <><div id="invariant" className="invariant">Yüz piksel kontrolü: hazırlanıyor…</div><main className="factorial">
    {combos.map(({face,ear,hair,hat}, i)=><article key={i} className="tile" data-combo={`${face}/${ear}/${hair}/${hat}`}><Avatar animal="" seed="faz8-face" equipped={box(face,ear,hair,hat)} size={size} pet={false}/><small>{face}/{ear}<br/>{hair.replace('hair_','')} · {label(hat)}</small></article>)}
  </main></>
}

function Mirrors() {
  return <main className="mirrors">{faces.map(face => hairs.map(hair => <section className="mirror" key={face+hair}>
    <h2>{face} · {hair}</h2><div className="pair">
      {[ '', 'cap', 'pom', 'cowboy'].map(hat => <div key={hat}><Avatar animal="" seed="faz8-face" equipped={box(face,'small',hair,hat)} size={250} pet={false}/><small>{label(hat)}</small></div>)}
    </div></section>))}</main>
}

function App() { return <><header><b>Faz 8 · Bölüm {section}</b><span>{section === '1' ? `${faces.length} yüz × ${ears.length} kulak × ${hairs.length} saç × ${hats.length} şapka` : 'Avatar karşılaştırma'}</span></header>{section === '1' ? <Factorial/> : section === 'mirror' ? <Mirrors/> : section === '2' ? <Eyes/> : section === '3' ? <Pets/> : <Items/>}</> }

const eyeShapes = ['round','almond','gentle','sparkle','upturned']
function Eyes(){return <main className="eye-grid">{eyeShapes.map(eye=><article key={eye}><Avatar animal="" seed="faz8-eyes" equipped={{eshape:`eshape_${eye}`}} size={size || 90} pet={false}/><b>{eye}</b></article>)}</main>}
const pets=['chick','cat','dog','rabbit','parrot','owl','turtle','fox','panda','bear','hedgehog','lion']
function Pets(){return <main className="pet-grid">{['cat','dog','rabbit','chick'].map(pet=><article key={pet}><h2>{pet}</h2><div className="pet-pair">{['side','hug'].map(pose=><div key={pose}><Avatar animal={pet} seed={`faz8-${pet}`} equipped={{pose:`pose_${pose}`}} size={size || 90} interactive/><small>{pose === 'side' ? 'temas' : 'kucak'}</small></div>)}</div></article>)}</main>}
function Items(){return <main className="mirror-grid">{['football','basketball','book','balloon','kite','icecream','toycar','flower'].map(item=><article key={item}><h2>{item}</h2><Avatar animal="" seed="faz8-item" equipped={{}} size={size || 250}/></article>)}</main>}

createRoot(document.getElementById('root')!).render(<App />)
