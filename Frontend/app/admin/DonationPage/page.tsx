import Navbar from "@/Components/admin/Navbar";
import Footer from "@/Components/Ngo/Footer";
import DonationPage from '@/Components/admin/DonationPage';

export default function Home(){
  return (
    <div>
      <Navbar />
      <DonationPage />  
      <Footer /> 
    </div>
  )
}

