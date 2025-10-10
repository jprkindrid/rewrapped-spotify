import Explanation from "../../shared-components/Explanation";
import NavBar from "../../shared-components/NavBar";

const HomePage = () => {
  return (
    <>
      <NavBar />
      <div className="dark:bg-spotify-black text-spotify-black flex w-screen justify-center pt-8 transition dark:text-white">
        <div className="mx-4 h-screen w-full max-w-5xl">
          <Explanation />
        </div>
      </div>
    </>
  );
};

export default HomePage;
