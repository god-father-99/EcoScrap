import Complaint from '@/Components/VENDOR/Complaint'
import Navbar from "@/Components/VENDOR/Navbar";
import Footer from "@/Components/VENDOR/Footer";

export default function Home(){
  return (
    <div>
      <Navbar />
      <Complaint /> 
      <Footer />   
    </div>
  )
}

