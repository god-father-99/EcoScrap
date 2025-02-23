import ProductList from "@/Components/Ngo/AllProducts";
import AllProducts from "@/Components/Ngo/AllProducts";
import Footer from "@/Components/Ngo/Footer";
import Navbar from "@/Components/Ngo/Navbar";




export default function Home(){
  return (
    <div>
      <Navbar />
      <AllProducts/>  
      <Footer /> 
    </div>
  )
}

