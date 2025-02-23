import Signin from '@/Components/VENDOR/Signin'
import Navbar from "@/Components/VENDOR/Navbar";
import Footer from "@/Components/VENDOR/Footer";

export default function Home(){
  return (
    <div>
      <Navbar />
      <Signin />
      <Footer/>   
    </div>
  )
}