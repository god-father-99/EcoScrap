import Community from '@/Components/VENDOR/VendorBidding'
import Navbar from "@/Components/Navbar";
import Footer from "@/Components/Footer";
import CategorySelection from '@/Components/category';

export default function Home(){
  return (
    <div>
      <Navbar />
      <CategorySelection/>   
      <Footer /> 
    </div>
  )
}

