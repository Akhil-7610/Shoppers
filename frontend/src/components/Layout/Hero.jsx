import React from 'react'
import heroImg from "../../assets/rabbit-hero.webp"
import { Link } from 'react-router-dom'

const Hero = () => {
    return (
        <section className="relative">
            <img src={heroImg} alt="Shoppers" className="w-full h-[350px] md:h-[600px] lg:h-[750px]" />
            <div className="absolute inset-0 bg-black flex bg-opacity-10 items-center justify-center">
                <div className="text-center text-white p-6">
                    <h1 className="text-4xl md:text-9xl font-bold tracking-tighter uppercase mb-4">
                        Vacation <br />Ready
                    </h1>
                    <p className="text-sm tracking-tighter md:text-lg mb-6">Explore our vacation-ready outfits with fast worldwide shipping.</p>
                    <Link to="/collections/all" className="bg-white text-gray-500 px-6 py-2 rounded-md text-lg hover:bg-red-rabbit hover:text-white hover:bg-rabbit-red transition-colors">
                        Shop Now
                    </Link>
                </div>
            </div>
        </section >
    )
}

export default Hero