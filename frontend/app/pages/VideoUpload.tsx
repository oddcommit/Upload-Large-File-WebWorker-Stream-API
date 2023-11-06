"use client"

import { useEffect, useState } from "react"
import axios from "axios";

const VideoUpload = () => {
  const [selectedFileName, setSelectedFileName] = useState<string | undefined>("");
  const [file, setFile] = useState<File>();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0]);
  }

  const handleWorkerMessage = async (e: any) => {
    try {
      const reponse = await axios.post(`http://localhost:8080/upload?fileName=${e.data.fileName}`, e.data.chunk);
      console.log(reponse)
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (!file) return;
    let worker;
    worker ??= new Worker("worker.js");
    worker.onmessage = handleWorkerMessage;
    worker.postMessage(file);
  }, [file])

  return (
    <div className="mx-auto max-w-xs">
      <label className="flex w-full cursor-pointer appearance-none items-center justify-center rounded-md border-2 border-dashed border-gray-200 p-6 transition-all hover:border-primary-300">
        <div className="space-y-1 text-center">
          <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-6 w-6 text-gray-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
            </svg>
          </div>
          <div className="text-gray-600"><a href="#" className="font-medium text-primary-500 hover:text-primary-700">Click to upload</a> or drag and drop</div>
          <p className="text-sm text-gray-500">{selectedFileName}</p>
        </div>
        <input type="file" className="sr-only" onChange={onChange} />
      </label>
    </div>
  )
}

export default VideoUpload;
