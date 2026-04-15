"use client"
import React from 'react'
import ProfileCard from '@/components/ProfileCard'
import { useUserStore } from '@/store/useUserStore'
import ServiceCard from '@/components/ServiceCard'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const page = () => {
  const user = useUserStore((state) => state.user)
  let about_us = [
    {
      id: 1,
      name: "Prashant",
      desc: "Neta Banne Ka Socha Hai...",
      imgName: "Zoro"
    },
    {
      id: 2,
      name: "Suyash",
      desc: "Padhai Me Mann Nhi Lagta...",
      imgName: "Luffy"
    },
    {
      id: 3,
      name: "Shivam",
      desc: "Aaj College Nhi Jaunga...",
      imgName: "Sanji"
    }
  ]

  let services = [
    {
      id: 1,
      title: "Buy And Sell",
      desc: "Students can buy and sell items with other students on our platform",
      link: "#"
    },
    {
      id: 2,
      title: "Lost And Found",
      desc: "Students can use our application for helping others find their lost items",
      link: "http://localhost:3000/protected/feed"
    },
    {
      id: 3,
      title: "Mess-Co",
      desc: "Students can coordinate with Mess Authority with our application.",
      link: "#"
    }
  ]

  return (
    <div className='bg-blue-100 min-h-screen space-y-10'>
      <div className='mb-10'>
        <Navbar />
      </div>

      <div className='text-black mb-10 p-3'>
        <h1 className='font-bold text-4xl text-center'>
          We Are Students Of NIT Delhi, <br />Dedicating this work for college
          Ecosystem
        </h1>
      </div>

      <div id='services' className='p-3 ml-10'>

        <h1 className='text-black mb-5 font-medium text-3xl'>Services</h1>

        <div className='grid grid-cols-3 justify-items-start'>
          {
            services.map((service) => (
              <ServiceCard key={service.id} title={service.title} desc={service.desc} link={service.link} />
            ))
          }
        </div>
      </div>

      <div id='about_us' className='p-0.5 ml-10 mb-15'>
        <h1 className='text-black mb-5 font-medium text-3xl'>About-Us</h1>
        <div className='grid grid-cols-3 justify-items-start'>
          {
          about_us.map((user) => {
            return <ProfileCard key={user.id} name={user.name} desc={user.desc} imgName={user.imgName} />
          })
        }
        </div>
      </div>

      <div>
        <Footer />
      </div>
    </div>
  )
}

export default page

