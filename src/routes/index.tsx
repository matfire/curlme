
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CurlForm from "@/components/CurlForm";
import { createFileRoute } from "@tanstack/react-router";


export const Route = createFileRoute('/')({
  component: Index
})

function Index() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto mb-10 text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            Create <span className="text-curl">curl</span> Commands with Ease
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            The simple, intuitive way to build and customize curl commands for your API requests. 
            No more memorizing flags or syntax!
          </p>
        </div>
        <CurlForm />
      </main>
      <Footer />
    </div>
  );
};
