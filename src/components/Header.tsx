
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold text-curl">curl<span className="text-gray-800">me</span></span>
          <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs">BETA</span>
        </div>
        <div className="flex items-center space-x-4">
          <Button asChild variant="outline" size="sm" className="flex items-center gap-2">
            <a href="https://github.com/matfire/curlme" target="_blank">
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">Star on GitHub</span>
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
