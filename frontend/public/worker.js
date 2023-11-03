onmessage = async (e) => {
  const file = e.data;
  try {
    const result = await countBitsBlob(file);
    postMessage({ type: "result", result });
  } catch (err) {
    postMessage({ type: "error", error: `${err}` });
  }
};

const countBitsBlob = async (blob) => {
  const ONES = [];
  for (let b = 0x00; b <= 0xFF; ++b) {
    let cnt = 0;
    for (let s = 0; s < 8; ++s) {
      if ((b >> s) % 2 === 1) {
        ++cnt;
      }
    }
    ONES.push(cnt);
  }

  const reader = (blob.stream()).getReader();
  let cnt = 0;

  while (true) {
    const { done, value: chunk } = await reader.read();
    if (done) {
      break;
    }
    for (const b of chunk) {
      cnt += ONES[b];
    }
  }

  return [8 * blob.size - cnt, cnt];
}
