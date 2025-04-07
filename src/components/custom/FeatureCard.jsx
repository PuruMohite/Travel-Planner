import React from 'react'

function FeatureCard({feature}) {
  return (
    <div className={`flex justify-center items-center md:space-y-4 space-x-4 mt-4 p-3 pl-5 md:p-5 md:pl-9 border-1 border-gray-300 rounded-xl bg-gray-50 transition-shadow hover:shadow-lg ${feature.isEven?"":"flex-row-reverse space-x-reverse justify-end"}`}>
        <div className='flex flex-col space-y-2 md:space-y-6'>
        <h2 className='text-xl md:text-3xl font-bold '>{feature.heading}</h2>
        <p className='text-md leading-snug  md:leading-normal md:text-lg max-w-80'>{feature.about}</p>
        </div>
        <div>
            <img src={feature.logoPath} className='h-50' alt="" />
        </div>
        
    </div>
  )
}

export default FeatureCard