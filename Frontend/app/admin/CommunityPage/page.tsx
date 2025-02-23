import Navbar from "@/Components/admin/Navbar";
import Footer from "@/Components/VENDOR/Footer";
import CommunityPage from '@/Components/admin/CommunityPage';

export default function Home(){
  return (
    <div>
      <Navbar />
      <CommunityPage />   
      <Footer /> 
    </div>
  )
}

