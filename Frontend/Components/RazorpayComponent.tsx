import Script from "next/script";

const RazorpayComponent = () => {
  return (
    <div>
      <h2>Razorpay Payment</h2>

      {/* Load Razorpay script dynamically */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive" // Loads script after page is interactive
      />
    </div>
  );
};

export default RazorpayComponent;
