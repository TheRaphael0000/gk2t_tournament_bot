export const timeFormat = new Intl.DateTimeFormat("fr-CH", {
  dateStyle: undefined,
  timeStyle: "medium",
});

export function logger(...args: string[]) {
  console.log(`${new Date().toISOString()}`, ...args);
}

export function messageBuilder(blocks: string[], header: string, footer: string, limit: number) {
  const fusedBlocks = [];

  let currentText = "";
  for (let i = 0; i < blocks.length; i++) {
    const currentBlock = blocks.at(i);
    currentText += currentBlock ?? "";
    const nextBlock = blocks.at(i + 1) ?? "";
    if ((header.length + currentText.length + nextBlock?.length + footer.length) > limit) {
      fusedBlocks.push(`${header}${currentText}${footer}`);
      currentText = "";
    }
  }
  if (currentText != "") {
    fusedBlocks.push(`${header}${currentText}${footer}`);
  }

  return fusedBlocks;
}

// for (let i of [5, 6, 7, 8, 9, 10, 11, 12, 13]) {
//   console.log(i, messageBuilder(["ABC", "DEF", "GHI"], "h ", " f", i));
// }
