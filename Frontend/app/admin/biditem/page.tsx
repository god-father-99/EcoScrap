import Navbar from "@/Components/admin/Navbar";
import SendBidRequest from "@/Components/admin/SendBidRequest";
import Footer from "@/Components/Footer";

export default function Home(){
  return (
    <div>
      <Navbar />
      <SendBidRequest />
      <Footer /> 
    </div>
  )
}

