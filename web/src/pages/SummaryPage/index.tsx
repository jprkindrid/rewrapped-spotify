import NavBar from "../../shared-components/NavBar";

export const SummaryPage = () => {
  return (
    <>
      <NavBar />
      <div className="flex h-screen justify-center bg-white font-sans">
        <div className="w-full max-w-5xl">
          <div className="flex flex-col items-center rounded-md px-4 text-center shadow-md">
            <h2 className="pt-4 text-3xl font-bold">Upload Your Data</h2>
            <div className="bg-spotify-green my-4 h-0.5 w-full"></div>
            <div className="my-2 max-w-2xl text-slate-500">
              Upload your streaming history JSON files, or entire .zip file to
              get started! Choose your files and then analyze the data!
            </div>
            <div>
              <button className="bg-spotify-green mx-2 rounded-full px-4 py-2 text-slate-50 hover:bg-green-700">
                Choose Files
              </button>
              <button className="bg-spotify-green mx-2 rounded-full px-4 py-2 text-slate-50 hover:bg-green-700">
                Analyze Data
              </button>
              <div className="my-2 text-slate-700 text-shadow-md">
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
