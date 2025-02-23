import SignUp from '@/Components/VENDOR/SignUp'
import Navbar from "@/Components/VENDOR/Navbar";
import Footer from "@/Components/VENDOR/Footer";


export default function Home(){
  return (
    <div>
      <Navbar />
      <SignUp />
      <Footer/>   
    </div>
  )
}