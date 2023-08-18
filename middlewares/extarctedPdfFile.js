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

const checkFomatLuong =(text, a ) => {
  const pattern = new RegExp(`${a}\\s+\\d+\\s*(?:triệu|tr)`)
  return pattern.test(text);
}

const extractSalaryInfo = (patterns,text) => {
  let minSal= null
  let maxSal= null

  const listMucLuongKW = keywordData.listMucLuong;
  const a = generationPattern(listMucLuongKW)

  if(checkFomatLuong(text,a)){
    // Sử dụng đơn vị chữ: 1tr || 1 triệu
    const arr = patterns.slice(2)
    for (const pattern of arr) {
      const match = text.match(pattern);
      if (match) {
        const m1 =  match[1]?match[1]:null;
        const m2 =  match[2]?match[2]:null;
  
        if(minSal===null)
          minSal = m1
        if(maxSal===null){
          maxSal = m2
        }
      }
    }
  }
  else {
    const arr = patterns.slice(0,2)
    // Không sử dụng đơn vị chữ: 1.000.000 || 1000000
    for (const pattern of arr) {
      const match = text.match(pattern);
      if (match) {
        const m1 =  match[1]?match[1].replace(/[.,]/g, ''):null;
        const m2 =  match[2]?match[2].replace(/[.,]/g, ''):null;
  
        if(minSal===null||Number(m1)>Number(minSal))
          minSal = m1
        if(maxSal===null||Number(m2)>Number(maxSal)){
          maxSal = m2
        }
      }
    }
  }

  return {min:minSal, max: maxSal};
}

const searchMucLuong = async (text) => {
  const listMucLuongKW = keywordData.listMucLuong;
  const a = generationPattern(listMucLuongKW)

  const patterns = [
    new RegExp(`${a}\\s+(\\d{1,3}(?:[.,]\\d{3})*)(?:\\s*(?:-|–|đến)\\s*(\\d{1,3}(?:[.,]\\d{3})*))?`),
    new RegExp(`${a}\\s+(\\b\\d{6,12}\\b)(?:\\s*(?:-|–|đến)\\s*(\\b\\d{6,12}\\b))`),
    new RegExp(`${a}\\s+(\\d+\\s*(?:triệu|tr))(?:\\s*(?:-|–|đến)\\s+(\\d+\\s*(?:triệu|tr)))`)
  ]

  const salary = extractSalaryInfo(patterns, text)
  return salary
};

const createRegexFromList = (array) => {
  const escapedArray = array.map(item => item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regexPattern = `(?:${escapedArray.join('|')})`;
  return new RegExp(regexPattern, 'gi');
};

const searchPhucLoi = async(text) => {
    const listPL = keywordData.listPhucLoi

    const regex = createRegexFromList(listPL);
    const matches = text.match(regex);
    if(matches){
        return matches
    }
    else return []
}

const chectIfExistInText = (text, arr) => {
  for(const a of arr){
    const match = text.match(a);
    if(match)return true
  }
  return false
}


const searchMoTa = async (text) => {
  const matchVttd = createRegexFromList(keywordData.listViTriTuyenDungKeyWord);
  const matchHtlv = createRegexFromList(keywordData.listFulltimeKeyWord.concat(keywordData.listParttimeKeyWord.concat(keywordData.listRemoteKeyWord)));
  const matchDcLv = createRegexFromList(keywordData.listLocationKeyWord);
  const matchThnhs = createRegexFromList(keywordData.listTimeKeyWord);
  const matchLuong = createRegexFromList(keywordData.listMucLuong);
  const matchCheDo = createRegexFromList(keywordData.listPhucLoi);
  const matchYc = createRegexFromList(keywordData.listYeuCauKeyWord);
  const matchTtK  = createRegexFromList(keywordData.listThongTinKhacKeyWord);

  const regexArray = [matchVttd, matchHtlv, matchDcLv, matchThnhs, matchLuong, matchCheDo, matchYc, matchTtK];
  const startPosRegex = createRegexFromList(keywordData.listMoTaCongViec)
  let lineStart = null
  let lineEnd = null
  const lines = text.split('\n').filter(item=> item.length>1)
  let match = ''

  for (const [index, value] of lines.entries()){
    const matcheStart = value.match(startPosRegex);
    if(matcheStart){
      if(lineStart===null) lineStart=index
      if(matcheStart[0].length>match.length&& index>= lineStart){
        match = matcheStart[0]
        lineStart = index
      }
    }
    if(lineEnd===null){
      if(chectIfExistInText(value,regexArray)&&index>lineStart&&lineStart!==null) lineEnd=index
    } 
  }

  if(lineStart === null) return ''
  else {
    const result = lines.slice(lineStart, lineEnd===null?lines.length:lineEnd).join('\n');
    return result
  }

}

const searchYeuCau = async (text) => {
  const matchVttd = createRegexFromList(keywordData.listViTriTuyenDungKeyWord);
  const matchHtlv = createRegexFromList(keywordData.listFulltimeKeyWord.concat(keywordData.listParttimeKeyWord.concat(keywordData.listRemoteKeyWord)));
  const matchDcLv = createRegexFromList(keywordData.listLocationKeyWord);
  const matchThnhs = createRegexFromList(keywordData.listTimeKeyWord);
  const matchLuong = createRegexFromList(keywordData.listMucLuong);
  const matchCheDo = createRegexFromList(keywordData.listPhucLoi);
  const matchMoTa = createRegexFromList(keywordData.listMoTaCongViec);
  const matchTtK  = createRegexFromList(keywordData.listThongTinKhacKeyWord);

  const regexArray = [matchVttd, matchHtlv, matchDcLv, matchThnhs, matchLuong, matchCheDo, matchMoTa, matchTtK];
  const startPosRegex = createRegexFromList(keywordData.listYeuCauKeyWord)
  let lineStart = null
  let lineEnd = null
  const lines = text.split('\n').filter(item=> item.length>1)

  let match = ''

  for (const [index, value] of lines.entries()){
    const matcheStart = value.match(startPosRegex);
    if(matcheStart){
      if(lineStart===null) lineStart=index
      if(matcheStart[0].length>match.length&& index>= lineStart){
        match = matcheStart[0]
        lineStart = index
      }
    }
    if(lineEnd===null){
      if(chectIfExistInText(value,regexArray)&&index>lineStart&&lineStart!==null) lineEnd=index
    } 
  }
  
  if(lineStart === null) return ''
  else {
    const result = lines.slice(lineStart, lineEnd===null?lines.length:lineEnd).join('\n');
    return result
  }

}

const searchThongTinKhac = async (text) => {
  const matchVttd = createRegexFromList(keywordData.listViTriTuyenDungKeyWord);
  const matchHtlv = createRegexFromList(keywordData.listFulltimeKeyWord.concat(keywordData.listParttimeKeyWord.concat(keywordData.listRemoteKeyWord)));
  const matchDcLv = createRegexFromList(keywordData.listLocationKeyWord);
  const matchThnhs = createRegexFromList(keywordData.listTimeKeyWord);
  const matchLuong = createRegexFromList(keywordData.listMucLuong);
  const matchCheDo = createRegexFromList(keywordData.listPhucLoi);
  const matchYc = createRegexFromList(keywordData.listYeuCauKeyWord);
  const matchMoTa  = createRegexFromList(keywordData.listMoTaCongViec);

  const regexArray = [matchVttd, matchHtlv, matchDcLv, matchThnhs, matchLuong, matchCheDo, matchYc, matchMoTa];
  const startPosRegex = createRegexFromList(keywordData.listThongTinKhacKeyWord)
  let lineStart = null
  let lineEnd = null
  const lines = text.split('\n').filter(item=> item.length>1)
  let match = ''

  for (const [index, value] of lines.entries()){
    const matcheStart = value.match(startPosRegex);
    if(matcheStart){
      if(lineStart===null) lineStart=index
      if(matcheStart[0].length>match.length&& index>= lineStart){
        match = matcheStart[0]
        lineStart = index
      }
    }
    if(lineEnd===null){
      if(chectIfExistInText(value,regexArray)&&index>lineStart&&lineStart!==null) lineEnd=index
    } 
  }

  if(lineStart === null) return ''
  else {
    const result = lines.slice(lineStart, lineEnd===null?lines.length:lineEnd).join('\n');
    return result
  }

}


const toObject = async (file) => {
  const pdfFilePath = file;

  let textFromPdf;

  await readPdf(pdfFilePath)
    .then((textContent) => {
      textFromPdf = textContent;
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  const vttd = await searchViTriLamViec(textFromPdf);
  const htlv = await searchHinhThucLamViec(textFromPdf);
  const dclv = await searchDiaDiemLamViec(textFromPdf);
  const timeNopHoSo = await searchThoiHanNopHoSo(textFromPdf);
  const luong = await searchMucLuong(textFromPdf);
  const chedo = await searchPhucLoi(textFromPdf)
  const mota = await searchMoTa(textFromPdf)
  const yeuCau = await searchYeuCau(textFromPdf)
  const thongTinKhac = await searchThongTinKhac(textFromPdf)

 return ({
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
    chedo:chedo
  });
};

module.exports = {
  toObject,
};
