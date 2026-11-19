import React from 'react'

export default function HeroComponent() {
  return (
    <div className='
      h-screen
      pt-16
      bg-[linear-gradient(rgba(0,0,0,0.55),rgba(0,0,0,0.55)),url(/assets/oficina-personas.jpg)]
      bg-cover
      bg-[-220px_64px]
    '>
      <div className='max-w-300 h-full mx-auto flex flex-col justify-center items-start relative'>
        <div className='w-[50%] flex gap-y-8 flex-col items-start'>
          <h1 className='text-4xl font-bold'>ASESÓRATE CON EXPERTOS</h1>
          <p className=''>Con experiencia trazamos el camino, con visión proyectamos el futuro y con estrategia impulsamos el éxito de tu empresa.</p>
          <button className='rounded-2xl bg-[#ffcb05] p-4'>CONTÁCTANOS</button>
        </div>
        <div className='w-full absolute bottom-24 flex flex-col items-center gap-4'>
          <span>APLICAMOS ESTÁNDARES</span>
          <div className='h-24 w-full flex justify-between'>
            <img src="assets/white_logos/collahuasi.png" alt="" />
            <img src="assets/white_logos/sqm.png" alt="" />
            <img src="assets/white_logos/mantos_copper.png" alt="" />
            <img src="assets/white_logos/sierra_gorda.png" alt="" />
            <img src="assets/white_logos/HMC.png" alt="" />
            <img src="assets/white_logos/quebrada_blanca.png" alt="" />
          </div>
        </div>
      </div>
    </div>
  )
}
