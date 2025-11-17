
import Navbar from "@/app/(components)/Navbar";
import Footer from "@/app/(components)/Footer";
import StoreProvider, { useAppSelector } from "./redux";

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-gray-50 w-full min-h-screen">
      {children}
    </div>
  );
};

const HomeWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <HomeLayout>{children}</HomeLayout>
    </StoreProvider>
  );
};
export default HomeWrapper;
