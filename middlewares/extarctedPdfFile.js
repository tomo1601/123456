const fs = require("fs");
const { PDFDocument, rgb } = require("pdf-lib");
const mammoth = require("mammoth");
const cheerio = require("cheerio");
const pdf = require("pdf-parse");
const { keywordData } = require("../models/data");

const readPdf = async (filePath) => {
  try {
    const pdfBytes = await fs.readFileSync(filePath);
    const data = await pdf(pdfBytes);
    //console.log(data.text)
    return data.text;
  } catch (error) {
    console.error("Error reading PDF:", error);
    throw error;
  }
};

const getHeadIndex = (arr, text, removeTextTitle) => {
  for (const a of arr) {
    const index = text.indexOf(a);
    if (index !== -1) {
      if (removeTextTitle) return index + a.length;
      else return { index: index, length: a.length };
    }
  }
  return -1;
};

const getEndIndex = (arr, text) => {
  let indexResult = text.indexOf(arr[0]);
  let wordLength = 0;
  for (const a of arr) {
    const index = text.indexOf(a);
    if (index > 0 && index < indexResult) {
      indexResult = index;
      wordLength = a.length;
    }
  }
  return { index: indexResult, length: wordLength };
};

const searchViTriLamViec = async (text) => {
  const listVTKeyWord = keywordData.listViTriTuyenDungKeyWord;
  const stopWord = [
    ".",
    "với ",
    "có",
    "cần",
    "được",
    "with",
    "have",
    "\n",
    ":",
  ];
  const indexVt = getHeadIndex(listVTKeyWord, text, true);
  const textRemain = text.substring(indexVt);

  if (indexVt === -1) {
    return "";
  } else {
    const indexEnd = getEndIndex(stopWord, textRemain).index + indexVt;
    const result = text.substring(indexVt, indexEnd).trim();
    return result;
  }
};

const searchHinhThucLamViec = async (text) => {
  const listFulltimeKeyWord = keywordData.listFulltimeKeyWord;
  const listParttimeKeyWord = keywordData.listParttimeKeyWord;
  const listRemoteKeyWord = keywordData.listRemoteKeyWord;

  const fullTimeIndex = getHeadIndex(listFulltimeKeyWord, text, false);
  const partTimeIndex = getHeadIndex(listParttimeKeyWord, text, false);
  const remoteIndex = getHeadIndex(listRemoteKeyWord, text, false);

  if (partTimeIndex !== -1) {
    return "Part-time";
  } else if (remoteIndex !== -1) {
    return "Remote";
  } else if (fullTimeIndex !== -1) {
    return "Full-time";
  }
  return "Full-time";
};

const searchDiaDiemLamViec = async (text) => {
  const listLocationKeyWord = keywordData.listLocationKeyWord;
  const stopWord = [".", "\n"];

  const headIndex = getHeadIndex(listLocationKeyWord, text, true);
  const textRemain = text.substring(headIndex);

  if (headIndex === -1) {
    return "";
  } else {
    const indexEnd = getEndIndex(stopWord, textRemain).index + headIndex;
    const result = text.substring(headIndex, indexEnd).trim();
    return result;
  }
};

const searchThoiHanNopHoSo = async (text) => {
  const listTimeKeyWord = keywordData.listTimeKeyWord;
  const stopWord = [".", "\n"];

  const headIndex = getHeadIndex(listTimeKeyWord, text, true);
  const textRemain = text.substring(headIndex);

  if (headIndex === -1) {
    return "";
  } else {
    const indexEnd = getEndIndex(stopWord, textRemain).index + headIndex;
    const result = text.substring(headIndex, indexEnd).trim();
    return result;
  }
};

const generationPattern = (arr) => {
  let text ='(?:'
  for(const a of arr) {
    if(a===arr[arr.length-1]) text+= a +")"
    else text+= a+'|'
  }
  return text
}

const extractSalaryInfo = (patterns,text) => {
  let minSal= null
  let maxSal= null
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      if(minSal===null) minSal = match[1].replace(/[.,]/g, '');
      if(maxSal===null||maxSal===minSal){
        maxSal = match[2] ? match[2].replace(/[.,]/g, '') : minSal;
      }
    }
  }

  return {min:minSal, max: maxSal};
}

const searchMucLuong = async (text) => {
  const listMucLuongKW = keywordData.listMucLuong;

  const patterns = [
    new RegExp(`${generationPattern(listMucLuongKW)}\\s+(\\d+(?:[.,]\\d{3})*)(?:\\s*(?:-|đến)\\s*(\\d+(?:[.,]\\d{3})*))?`),
    new RegExp(`${generationPattern(listMucLuongKW)}\\s+(\\d+)\\s*triệu(?:\\s*(?:-|đến)\\s*(\\d+)\\s*triệu)?`),
    new RegExp(`${generationPattern(listMucLuongKW)}\\s+(\\d+)\\s*triệu`),
    new RegExp(`${generationPattern(listMucLuongKW)}\\s+(\\d{1,3}(?:,\\d{3})*)(?:\\s*(?:-|đến)\\s*(\\d{1,3}(?:,\\d{3})*))?`),
    new RegExp(`${generationPattern(listMucLuongKW)}\\s+(\\d{1,3})\\s*triệu(?:\\s*(?:-|đến)\\s*(\\d{1,3})\\s*triệu)?`)
  ]

  const salary = extractSalaryInfo(patterns, text)
  console.log(salary)
  return salary

  /* const headIndex = getHeadIndex(listMucLuongKW, text, false);
  const textRemain = text.substring(headIndex.index);
  if (headIndex === -1) {
    return "";
  } else {
    const indexEnd = getEndIndex(stopWord, textRemain).index + headIndex.index;
    console.log(headIndex.index, indexEnd)
    const result = text.substring(headIndex.index, indexEnd).trim();
    return result;
  } */
};

const toObject = async (file) => {
  const pdfFilePath = "./files/JD-NHANVIENKYTHUATLAYOUT.pdf";

  let textFromPdf;

  await readPdf(pdfFilePath)
    .then((textContent) => {
      textFromPdf = textContent;
      console.log(textFromPdf);
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  const vttd = await searchViTriLamViec(textFromPdf);
  const htlv = await searchHinhThucLamViec(textFromPdf);
  const dclv = await searchDiaDiemLamViec(textFromPdf);
  const timeNopHoSo = await searchThoiHanNopHoSo(textFromPdf);
  const luong = await searchMucLuong(textFromPdf);
  console.log(luong);

  console.log({
    congViec: vttd,
    hinhThucLamViec: htlv,
    diaDiemLamViec: dclv,
    thoiHanNopHoSo: timeNopHoSo,
    chitietcongviec: {
      yeucauungvien: "",
      motacongviec: "",
      thongtinkhac: "",
    },
    mucLuong: luong,
  });
};

module.exports = {
  toObject,
};
