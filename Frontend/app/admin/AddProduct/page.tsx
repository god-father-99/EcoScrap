import AddProduct from "@/Components/admin/AddProduct";
import Navbar from "@/Components/admin/Navbar";
import Footer from "@/Components/Footer";

export default function Home(){
  return (
    <div>
      <Navbar />
      <AddProduct />
      <Footer /> 
    </div>
  )
}

