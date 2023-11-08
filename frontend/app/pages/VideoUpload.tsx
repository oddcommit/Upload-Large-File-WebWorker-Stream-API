"use client"

import { useEffect, useState } from "react"
import axios from "axios";

type UploadedFilesType = {
  url: string,
  name: string | undefined,
}

const VideoUpload = () => {
  const [selectedFileName, setSelectedFileName] = useState<string | undefined>("");
  const [file, setFile] = useState<File>();
  const [progress, setProgress] = useState(0);
  const [uploadedFiles, setUploadFiles] = useState<UploadedFilesType[]>([]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0]);
    setProgress(0);
  }

  useEffect(() => {
    if (!file) return;
    setSelectedFileName(file.name);
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);
    fileReader.onload = async (event: ProgressEvent<FileReader>) => {
      const content = event.target?.result as ArrayBuffer;
      const CHUNK_SIZE = 1000000;
      const totalChunks = content.byteLength / CHUNK_SIZE;
      const fileName = Math.random().toString(36).slice(-6) + file.name;
      for (let chunk = 0; chunk < totalChunks + 1; chunk++) {
        const CHUNK = content.slice(
          chunk * CHUNK_SIZE,
          (chunk + 1) * CHUNK_SIZE
        );
        let fileIndex = chunk;
        const res = await axios.post(`http://localhost:8080/upload?fileName=${fileName}&fileIndex=${fileIndex}`, CHUNK).catch((err) => {
          console.error(err)
        })
        setProgress((res?.data) * 100 / Math.ceil(totalChunks));
      }
      setUploadFiles((prevUploadedFiles) => [
        ...prevUploadedFiles,
        { url: `http://localhost:8080/uploads/${fileName}`, name: file.name },
      ]);
    };
  }, [file])

  return (
    <div className="flex flex-col">
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
        <div className="flex justify-center h-10 items-center">
          <p>{Math.ceil(progress)}%</p>
        </div>
      </div>
      <div>
        {
          uploadedFiles.map((val, key) => {
            return (
              <div key={key}>
                <div className="flex flex-col items-center justify-center">
                  <video controls src={val.url} className=" w-52 h-52 hover:w-[400px] hover:h-[400px]" />
                  <label>{val.name}</label>
                </div>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}

export default VideoUpload;
