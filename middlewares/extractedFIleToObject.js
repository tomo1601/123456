const fs = require("fs");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const mammoth = require("mammoth");
const cheerio = require("cheerio");
const { keywordData } = require("../models/data");

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
  let text = "(?:";
  for (const a of arr) {
    if (a === arr[arr.length - 1]) text += a + ")";
    else text += a + "|";
  }
  return text;
};

const checkFomatLuong = (text, a) => {
  const pattern = new RegExp(`${a}\\s+\\d+\\s*(?:triệu|tr)`);
  return pattern.test(text);
};

const extractSalaryInfo = (patterns, text) => {
  let minSal = null;
  let maxSal = null;

  const listMucLuongKW = keywordData.listMucLuong;
  const a = generationPattern(listMucLuongKW);

  if (checkFomatLuong(text, a)) {
    // Sử dụng đơn vị chữ: 1tr || 1 triệu
    const arr = patterns.slice(2);
    for (const pattern of arr) {
      const match = text.match(pattern);
      if (match) {
        const m1 = match[1] ? match[1] : null;
        const m2 = match[2] ? match[2] : null;

        if (minSal === null) minSal = m1;
        if (maxSal === null) {
          maxSal = m2;
        }
      }
    }
  } else {
    const arr = patterns.slice(0, 2);
    // Không sử dụng đơn vị chữ: 1.000.000 || 1000000
    for (const pattern of arr) {
      const match = text.match(pattern);
      if (match) {
        const m1 = match[1] ? match[1].replace(/[.,]/g, "") : null;
        const m2 = match[2] ? match[2].replace(/[.,]/g, "") : null;

        if (minSal === null || Number(m1) > Number(minSal)) minSal = m1;
        if (maxSal === null || Number(m2) > Number(maxSal)) {
          maxSal = m2;
        }
      }
    }
  }

  return { min: minSal, max: maxSal };
};

const searchMucLuong = async (text) => {
  const listMucLuongKW = keywordData.listMucLuong;
  const a = generationPattern(listMucLuongKW);

  const patterns = [
    new RegExp(
      `${a}\\s+(\\d{1,3}(?:[.,]\\d{3})*)(?:\\s*(?:-|–|đến)\\s*(\\d{1,3}(?:[.,]\\d{3})*))?`
    ),
    new RegExp(
      `${a}\\s+(\\b\\d{6,12}\\b)(?:\\s*(?:-|–|đến)\\s*(\\b\\d{6,12}\\b))`
    ),
    new RegExp(
      `${a}\\s+(\\d+\\s*(?:triệu|tr))(?:\\s*(?:-|–|đến)\\s+(\\d+\\s*(?:triệu|tr)))`
    ),
  ];

  const salary = extractSalaryInfo(patterns, text);
  return { min: Number(salary.min), max: Number(salary.max) };
};

const createRegexFromList = (array) => {
  const escapedArray = array.map((item) =>
    item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );
  const regexPattern = `(?:${escapedArray.join("|")})`;
  return new RegExp(regexPattern, "gi");
};

const searchPhucLoi = async (text) => {
  const listPL = keywordData.listPhucLoi;

  const regex = createRegexFromList(listPL);
  const matches = text.match(regex);
  if (matches) {
    return matches;
  } else return [];
};

const chectIfExistInText = (text, arr) => {
  for (const a of arr) {
    const match = text.match(a);
    if (match) return true;
  }
  return false;
};

const searchMoTa = async (text) => {
  const matchVttd = createRegexFromList(keywordData.listViTriTuyenDungKeyWord);
  const matchHtlv = createRegexFromList(
    keywordData.listFulltimeKeyWord.concat(
      keywordData.listParttimeKeyWord.concat(keywordData.listRemoteKeyWord)
    )
  );
  const matchDcLv = createRegexFromList(keywordData.listLocationKeyWord);
  const matchThnhs = createRegexFromList(keywordData.listTimeKeyWord);
  const matchLuong = createRegexFromList(keywordData.listMucLuong);
  const matchCheDo = createRegexFromList(keywordData.listPhucLoi);
  const matchYc = createRegexFromList(keywordData.listYeuCauKeyWord);
  const matchTtK = createRegexFromList(keywordData.listThongTinKhacKeyWord);

  const regexArray = [
    matchVttd,
    matchHtlv,
    matchDcLv,
    matchThnhs,
    matchLuong,
    matchCheDo,
    matchYc,
    matchTtK,
  ];
  const startPosRegex = createRegexFromList(keywordData.listMoTaCongViec);
  let lineStart = null;
  let lineEnd = null;
  const lines = text
    .split("\n")
    .filter((item) => item.length > 1 && !/(http|https):\/\/\S+/i.test(item));
  let match = "";

  for (const [index, value] of lines.entries()) {
    const matcheStart = value.match(startPosRegex);
    if (matcheStart) {
      if (lineStart === null) lineStart = index;
      if (matcheStart[0].length > match.length && index >= lineStart) {
        match = matcheStart[0];
        lineStart = index;
      }
    }
    if (lineEnd === null) {
      if (
        chectIfExistInText(value, regexArray) &&
        index > lineStart &&
        lineStart !== null
      )
        lineEnd = index;
    }
  }

  if (lineStart === null) return "";
  else {
    const result = lines
      .slice(lineStart, lineEnd === null ? lines.length : lineEnd)
      .join("\n");
    return result;
  }
};

const searchYeuCau = async (text) => {
  const matchVttd = createRegexFromList(keywordData.listViTriTuyenDungKeyWord);
  const matchHtlv = createRegexFromList(
    keywordData.listFulltimeKeyWord.concat(
      keywordData.listParttimeKeyWord.concat(keywordData.listRemoteKeyWord)
    )
  );
  const matchDcLv = createRegexFromList(keywordData.listLocationKeyWord);
  const matchThnhs = createRegexFromList(keywordData.listTimeKeyWord);
  const matchLuong = createRegexFromList(keywordData.listMucLuong);
  const matchCheDo = createRegexFromList(keywordData.listPhucLoi);
  const matchMoTa = createRegexFromList(keywordData.listMoTaCongViec);
  const matchTtK = createRegexFromList(keywordData.listThongTinKhacKeyWord);

  const regexArray = [
    matchVttd,
    matchHtlv,
    matchDcLv,
    matchThnhs,
    matchLuong,
    matchCheDo,
    matchMoTa,
    matchTtK,
  ];
  const startPosRegex = createRegexFromList(keywordData.listYeuCauKeyWord);
  let lineStart = null;
  let lineEnd = null;
  const lines = text
    .split("\n")
    .filter((item) => item.length > 1 && !/(http|https):\/\/\S+/i.test(item));

  let match = "";

  for (const [index, value] of lines.entries()) {
    const matcheStart = value.match(startPosRegex);
    if (matcheStart) {
      if (lineStart === null) lineStart = index;
      if (matcheStart[0].length > match.length && index >= lineStart) {
        match = matcheStart[0];
        lineStart = index;
      }
    }
    if (lineEnd === null) {
      if (
        chectIfExistInText(value, regexArray) &&
        index > lineStart &&
        lineStart !== null
      )
        lineEnd = index;
    }
  }

  if (lineStart === null) return "";
  else {
    const result = lines
      .slice(lineStart, lineEnd === null ? lines.length : lineEnd)
      .join("\n");
    return result;
  }
};

const searchThongTinKhac = async (text) => {
  const matchVttd = createRegexFromList(keywordData.listViTriTuyenDungKeyWord);
  const matchHtlv = createRegexFromList(
    keywordData.listFulltimeKeyWord.concat(
      keywordData.listParttimeKeyWord.concat(keywordData.listRemoteKeyWord)
    )
  );
  const matchDcLv = createRegexFromList(keywordData.listLocationKeyWord);
  const matchThnhs = createRegexFromList(keywordData.listTimeKeyWord);
  const matchLuong = createRegexFromList(keywordData.listMucLuong);
  const matchCheDo = createRegexFromList(keywordData.listPhucLoi);
  const matchYc = createRegexFromList(keywordData.listYeuCauKeyWord);
  const matchMoTa = createRegexFromList(keywordData.listMoTaCongViec);

  const regexArray = [
    matchVttd,
    matchHtlv,
    matchDcLv,
    matchThnhs,
    matchLuong,
    matchCheDo,
    matchYc,
    matchMoTa,
  ];
  const startPosRegex = createRegexFromList(
    keywordData.listThongTinKhacKeyWord
  );
  let lineStart = null;
  let lineEnd = null;
  const lines = text
    .split("\n")
    .filter((item) => item.length > 1 && !/(http|https):\/\/\S+/i.test(item));
  let match = "";

  for (const [index, value] of lines.entries()) {
    const matcheStart = value.match(startPosRegex);
    if (matcheStart) {
      if (lineStart === null) lineStart = index;
      if (matcheStart[0].length > match.length && index >= lineStart) {
        match = matcheStart[0];
        lineStart = index;
      }
    }
    if (lineEnd === null) {
      if (
        chectIfExistInText(value, regexArray) &&
        index > lineStart &&
        lineStart !== null
      )
        lineEnd = index;
    }
  }

  if (lineStart === null) return "";
  else {
    const result = lines
      .slice(lineStart, lineEnd === null ? lines.length : lineEnd)
      .join("\n");
    return result;
  }
};

const extractFileWordToObject = async (file) => {
  const content = fs.readFileSync(file);

  //get text content
  const zip = new PizZip();
  zip.load(content);
  const doc = new Docxtemplater().loadZip(zip);
  const extractedText = doc.getFullText();

  //get html text
  let textHtml;
  await mammoth
    .convertToHtml({ buffer: content })
    .then((result) => {
      textHtml = result.value;
    })
    .catch((error) => {
      console.error("Error converting document:", error);
    });

  //load text to cheerio / remove img tag
  const $ = cheerio.load(textHtml);
  $("img").remove();

  const paragraph = $('p').map((_, element) => $(element).text().trim()).get();
  const newHtmltext = paragraph.join('\n')

  const vttd = await searchViTriLamViec(newHtmltext);
  const htlv = await searchHinhThucLamViec(newHtmltext);
  const dclv = await searchDiaDiemLamViec(newHtmltext);
  const timeNopHoSo = await searchThoiHanNopHoSo(newHtmltext);
  const luong = await searchMucLuong(newHtmltext);
  const chedo = await searchPhucLoi(newHtmltext);
  const mota = await searchMoTa(newHtmltext);
  const yeuCau = await searchYeuCau(newHtmltext);
  const thongTinKhac = await searchThongTinKhac(newHtmltext);

  return {
    congViec: vttd,
    hinhThucLamViec: htlv,
    diaDiemLamViec: dclv,
    thoiHanNopHoSo: timeNopHoSo,
    chitietcongviec: {
      yeucauungvien: yeuCau,
      motacongviec: mota,
      thongtinkhac: thongTinKhac,
    },
    mucLuong: luong,
    chedo: chedo,
  };

  return tinTuyenDung;
};
module.exports = {
  extractFileWordToObject,
};
