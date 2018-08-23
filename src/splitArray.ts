const splitToChunks = (arr: Array<any>, chunkSize: number) => {
  const result = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(...arr.slice(i, i + chunkSize));
  }
  return result;
}

export default splitToChunks;
