import Community from '@/Components/VENDOR/VendorBidding'
import Navbar from "@/Components/VENDOR/Navbar";
import Footer from "@/Components/VENDOR/Footer";
import DonationPage from '@/Components/VENDOR/DonationAgenciesPage';

export default function Home(){
  return (
    <div>
      <Navbar />
      <DonationPage />  
      <Footer /> 
    </div>
  )
}

