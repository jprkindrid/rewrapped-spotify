import NavBar from "../../shared-components/NavBar";

export const SummaryPage = () => {
  return (
    <>
      <NavBar />
      <div className="dark:bg-spotify-black text-spotify-black flex h-screen justify-center bg-white font-sans transition dark:text-white">
        <div className="w-full max-w-5xl">
          <div className="mt-4 flex flex-col items-center rounded-md px-4 text-center shadow-sm dark:shadow-white">
            <h2 className="pt-4 text-3xl font-bold">Upload Your Data</h2>
            <div className="bg-spotify-green my-4 h-0.5 w-full"></div>
            <div className="my-2 max-w-2xl text-slate-500 dark:text-slate-300">
              Upload your streaming history JSON files, or entire .zip file to
              get started! Choose your files and then analyze the data!
            </div>
            <div className="py-2">
              <div className="mb-4">
                <button className="bg-spotify-green mx-2 rounded-full px-4 py-2 text-slate-50 hover:bg-green-700">
                  Choose Files
                </button>
                <button className="bg-spotify-green mx-2 rounded-full px-4 py-2 text-slate-50 hover:bg-green-700">
                  Analyze Data
                </button>
              </div>

              <div className="my-2 text-slate-700 text-shadow-xs dark:text-slate-400 dark:text-shadow-white">
                File Selected: DarudeSandstorm.json
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SummaryPage;
