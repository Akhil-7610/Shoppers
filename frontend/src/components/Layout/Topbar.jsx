
import {TbBrandMeta} from 'react-icons/tb'
import {IoLogoInstagram} from 'react-icons/io'
import {RiTwitterXLine} from 'react-icons/ri'
const Topbar = () => {
  return (
    <div className='bg-rabbit-red text-white'>
        <div className="container mx-auto flex  items-center py-3 px-4">
            <div className='hidden md:flex item-center space-x-4'>
                <a href="#" className='hover:text-gray-300'>
                    <TbBrandMeta className='h-5 w-5' />
                </a>
                <a href="#" className='hover:text-gray-300'>
                    <IoLogoInstagram className='h-5 w-5' />
                </a>
                <a href="#" className='hover:text-gray-300'>
                    <RiTwitterXLine className='h-5 w-5' />
                </a>
            </div>
            <div className='text-sm  text-center flex-grow'> 
            <span>We Ship Worldwide - Faster and Reliable Shipping!</span>
            </div>
            <div className='text-sm'>
                <a href="tel:+91 9876543210" className='hover:text-gray-300 hidden md:block'>+91 9876543210</a>
            </div>
        </div>
    </div>
  )
}

export default Topbar