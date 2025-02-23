import Community from '@/Components/VENDOR/VendorBidding'
import Navbar from "@/Components/Ngo/Navbar";
import Footer from "@/Components/Ngo/Footer";
import DonationPage from '@/Components/Ngo/DonationPage';

export default function Home(){
  return (
    <div>
      <Navbar />
      <DonationPage />  
      <Footer /> 
    </div>
  )
}

