onmessage = async (e) => {
  const file = e.data;
  const fileReader = new FileReader();
  fileReader.readAsArrayBuffer(file);
  fileReader.onload = async (event) => {
    const content = event.target?.result;
    const CHUNK_SIZE = 10000;
    const totalChunks = content.byteLength / CHUNK_SIZE;
    const fileName =
      Math.random().toString(36).slice(-6) + file.name;

    for (let chunk = 0; chunk < totalChunks + 1; chunk++) {
      const CHUNK = content.slice(
        chunk * CHUNK_SIZE,
        (chunk + 1) * CHUNK_SIZE
      );
      postMessage({ fileName: fileName, chunk: CHUNK });
    }
  };
};