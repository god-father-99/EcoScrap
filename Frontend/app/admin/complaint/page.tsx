import Complaint from '@/Components/admin/complaint'
import Navbar from "@/Components/admin/Navbar";
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

