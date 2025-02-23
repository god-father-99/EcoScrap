

import Footer from "@/Components/Ngo/Footer";
import Navbar from "@/Components/Ngo/Navbar";
import RequestPickup from "@/Components/Ngo/request";



export default function Home(){
  return (
    <div>
      <Navbar />
      <RequestPickup/>  
      <Footer /> 
    </div>
  )
}

