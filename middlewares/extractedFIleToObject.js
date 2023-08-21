const fs = require('fs');
const PizZip  = require('pizzip');
const Docxtemplater = require('docxtemplater');
const mammoth = require('mammoth')
const cheerio = require('cheerio');
const {keywordData} = require('../models/data');

const getTagIncludeKeyword = (arr, text, tagName) => {
    const $ = cheerio.load(text)
    for(const a of arr) {
        const textContains = `${tagName}:contains("${a}")`
        const result = $(textContains).first().html();
        if(result!==null) return {
            parent: $(textContains).first().html(),
            child: $(textContains).first().children().html()
        }
    }
    return null;
}

const getHeadIndex = (arr, text, removeTextTitle) => {
    for(const a of arr) {
        const index = text.indexOf(a)
        if(index!==-1){
            if(removeTextTitle) return index +a.length;
            else return {index: index, length: a.length}
        }
    }
    return -1;
}

const getEndIndex = (arr, text) => {

    let indexResult =  text.indexOf(arr[0])
    let wordLength = 0
    for(const a of arr) {
        const index = text.indexOf(a)
        if(index>0 && index< indexResult){
            indexResult = index;
            wordLength = a.length
        }
    }
    return {index:indexResult, length: wordLength};
}

const loaiBoTheHtml = (text) => {
    return text.replace(/<\/?[^>]+(>|$)/g, "");
  }

const searchViTriLamViec = async(text) => {
    const listVTKeyWord = keywordData.listViTriTuyenDungKeyWord
    const stopWord = ['.', 'với', 'có', 'cần', 'được', 'with', 'have', ':', '\n']

    const indexVt = getHeadIndex(listVTKeyWord, text, true)
    const textRemain = text.substring(indexVt)
    
    if(indexVt===-1){
        return ''
    }
    else {
        const indexEnd = getEndIndex(stopWord, textRemain).index + indexVt
        const result = text.substring(indexVt, indexEnd).trim()

        const $ = cheerio.load(text);
        const getVTYeuCau = getTagIncludeKeyword(listVTKeyWord, text, 'p')

        if(getVTYeuCau.child!==null){
            if(result.length>getVTYeuCau.child.length){
                if(result.includes(getVTYeuCau.child)) return getVTYeuCau.child
                else return result
            }
            else {
                if(getVTYeuCau.child.includes(result)) return result
                else return getVTYeuCau.child
            }
        }
        else return result
    }

}

const searchHinhThucLamViec = async(text) => {

    const listFulltimeKeyWord = keywordData.listFulltimeKeyWord
    const listParttimeKeyWord = keywordData.listParttimeKeyWord
    const listRemoteKeyWord = keywordData.listRemoteKeyWord


    const fullTimeIndex = getHeadIndex(listFulltimeKeyWord, text, false)
    const partTimeIndex = getHeadIndex(listParttimeKeyWord, text, false)
    const remoteIndex = getHeadIndex(listRemoteKeyWord, text, false)

    if(partTimeIndex!==-1){
        return 'Part-time'
    }
    else if(remoteIndex!==-1){
        return 'Remote'
    }
    else if(fullTimeIndex!==-1){
        return 'Full-time'
    }
    return 'Full-time'
} 

const searchDiaDiemLamViec = async(text) => {
    
    const listLocationKeyWord = keywordData.listLocationKeyWord
    const closingTags = ["</p>","</h1>", "</h2>", "</h3>", "</h4>", "</h5>", "</h6>","</strong>", "</b>","</em>", "</i>","</u>","</s>", "</del>", "</strike>","</sup>","</sub>","</a>","</ul>","</ol>","</li>","</table>","</tr>","</td>","</th>","</iframe>"];

    const headIndex = getHeadIndex(listLocationKeyWord, text, true)
    const textRemain = text.substring(headIndex)
    
    if(headIndex===-1){
        return ''
    }
    else {
        const indexEnd = getEndIndex(closingTags, textRemain).index + headIndex
        const result = text.substring(headIndex, indexEnd).trim()
        const $ = cheerio.load(text);

        const diaDiemLamViec = getTagIncludeKeyword(listLocationKeyWord, text, 'p')

        if(diaDiemLamViec.child!==null){
            if(result.length>diaDiemLamViec.child.length){
                if(result.includes(diaDiemLamViec.child)) return diaDiemLamViec.child
                else return result
            }
            else {
                if(diaDiemLamViec.child.includes(result)||diaDiemLamViec.parent.includes(result)) return result
                else return diaDiemLamViec.child
            }
        }
        else return result
    }   
} 


const searchThoiHanNopHoSo = async (text) => {
    const listTimeKeyWord = keywordData.listTimeKeyWord

    const closingTags = ["</p>","</h1>", "</h2>", "</h3>", "</h4>", "</h5>", "</h6>","</strong>", "</b>","</em>", "</i>","</u>","</s>", "</del>", "</strike>","</sup>","</sub>","</a>","</ul>","</ol>","</li>","</table>","</tr>","</td>","</th>","</iframe>"];


    const headIndex = getHeadIndex(listTimeKeyWord, text, true)
    const textRemain = text.substring(headIndex)

    if(headIndex===-1){
        return ''
    }
    else {
        const indexEnd = getEndIndex(closingTags, textRemain).index + headIndex
        const result = text.substring(headIndex, indexEnd).trim()
        const $ = cheerio.load(text);

        const thoiGianLamViec = getTagIncludeKeyword(listTimeKeyWord, text, 'p')

        if(thoiGianLamViec.child!==null){
            if(result.length>thoiGianLamViec.child.length){
                if(result.includes(thoiGianLamViec.child)) return thoiGianLamViec.child
                else return result
            }
            else {
                if(thoiGianLamViec.child.includes(result)||thoiGianLamViec.parent.includes(result)) return result
                else return thoiGianLamViec.child
            }
        }
        else return result
    }
}


const searchYeuCauUngVien = async (text, arr) => {
    const listYeuCauKeyWord = keywordData.listYeuCauKeyWord

    const $ = cheerio.load(text);
    const yeucau = getTagIncludeKeyword(listYeuCauKeyWord, text, 'p')

    const arrPart = arr
    const listKeyWord = []

    for( const a of arrPart){
        if(a!==null){
            if(a.child!==null) listKeyWord.unshift(a.child)
            else listKeyWord.unshift(a.parent)
        }
    }

    const resultyeuCau = $(`p:contains(${yeucau.child?yeucau.child:yeucau.parent})`).nextUntil((index, element) => {
        const text = $(element).text();
        return listKeyWord.some(condition => text.includes(condition));
      })
      .map((_, elem) => $(elem).text().trim())
      .get()
      .join('\n');

    return resultyeuCau
}

const searchMoTaCongViec = async (text, arr) => {
    const listMoTaCongViec = keywordData.listMoTaCongViec

    const $ = cheerio.load(text);
    const mota = getTagIncludeKeyword(listMoTaCongViec, text, 'p')

    const arrPart = arr
    const listKeyWord = []

    for( const a of arrPart){
        if(a!==null){
            if(a.child!==null) listKeyWord.unshift(a.child)
            else listKeyWord.unshift(a.parent)
        }
    }

    const resultmota = $(`:contains(${mota.child?mota.child:mota.parent})`).nextUntil((index, element) => {
        const text = $(element).text();
        return listKeyWord.some(condition => text.includes(condition));
      })
      .map((_, elem) => $(elem).text().trim())
      .get()
      .join('\n');


    return resultmota
}

const searchThongTinKhac = async (text, arr) => {
    const listThongTinKhac = keywordData.listThongTinKhacKeyWord

    const $ = cheerio.load(text);
    const thongTinKhac = getTagIncludeKeyword(listThongTinKhac, text, 'p')

    const arrPart = arr
    const listKeyWord = []
    
    for( const a of arrPart){
        if(a!==null){
            if(a.child!==null) listKeyWord.unshift(a.child)
            else listKeyWord.unshift(a.parent)
        }
    }

    const resultthongTinKhac = $(`:contains(${thongTinKhac.child?thongTinKhac.child:thongTinKhac.parent})`).nextUntil((index, element) => {
        const text = $(element).text();
        return listKeyWord.some(condition => text.includes(condition));
      })
      .map((_, elem) => $(elem).text().trim())
      .get()
      .join('\n');


    return resultthongTinKhac
}

/* const searchMucLuong = async (text, arr) => {
    const listMucLuongKW = keywordData.listMucLuong

    const $ = cheerio.load(text);
    const mucLuong = getTagIncludeKeyword(listMucLuongKW, text, 'p')

    const arrPart = arr
    const listKeyWord = []
    
    for( const a of arrPart){
        if(a!==null){
            if(a.child!==null) listKeyWord.unshift(a.child)
            else listKeyWord.unshift(a.parent)
        }
    }

    const resultmucLuong = $(`:contains(${mucLuong.child?mucLuong.child:mucLuong.parent})`).nextUntil((index, element) => {
        const text = $(element).text();
        return listKeyWord.some(condition => text.includes(condition));
      })
      .map((_, elem) => $(elem).text().trim())
      .get()
      .join('\n');

    return resultmucLuong
} */

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
const removeCloseTagsExcess = (text) => {
    const closingTags = ["</p>","</h1>", "</h2>", "</h3>", "</h4>", "</h5>", "</h6>","</strong>", "</b>","</em>", "</i>","</u>","</s>", "</del>", "</strike>","</sup>","</sub>","</a>","</ul>","</ol>","</li>","</table>","</tr>","</td>","</th>","</iframe>", ':', ',', ',',';','?'];

    let resultText = text.trim()
    for(const a of closingTags) {
        const index = resultText.indexOf(a)
        if(index===0){
            resultText= resultText.replace(a, '', 1);
        }
    }
    return resultText;
}

const removePsWithLinks = (html) => {
    const $ = cheerio.load(html);

    $('p').each((index, element) => {
        const pText = $(element).text();
        if (pText.includes('http://') || pText.includes('https://')) {
            $(element).remove();
        }
    });

    return $.html();
}

const extractFileWordToObject = async (file) => {
      
    const content = fs.readFileSync(file);
    
    //get text content
    const zip = new PizZip();
    zip.load(content);
    const doc = new Docxtemplater().loadZip(zip);
    const extractedText = doc.getFullText();

    //get html text
    let textHtml
    await mammoth.convertToHtml({ buffer: content })
    .then((result) => {
      textHtml = result.value
    })
    .catch((error) => {
      console.error('Error converting document:', error);
    });

    //load text to cheerio / remove img tag
    const $ = cheerio.load(textHtml);
    $('img').remove();

    const newHtmltext = removePsWithLinks($.html())

    const getmota = getTagIncludeKeyword(keywordData.listMoTaCongViec, newHtmltext, 'p')
    const getyeucau = getTagIncludeKeyword(keywordData.listYeuCauKeyWord, newHtmltext, 'p')
    const getThongTinKhac = getTagIncludeKeyword(keywordData.listThongTinKhacKeyWord, newHtmltext, 'p')
    const getCongViec = getTagIncludeKeyword(keywordData.listViTriTuyenDungKeyWord, newHtmltext, 'p')
    const getDiaDiemLamViec = getTagIncludeKeyword(keywordData.listLocationKeyWord, newHtmltext, 'p')
    const getListThoiHanNopHoSo = getTagIncludeKeyword(keywordData.listTimeKeyWord, newHtmltext, 'p')
    const getMucLuong = getTagIncludeKeyword(keywordData.listMucLuong, newHtmltext, 'p')
    const getThoiGianLamViec = getTagIncludeKeyword(["Thời gian làm việc"], newHtmltext, 'p')
    
    const arr = [getMucLuong, getmota, getyeucau, getCongViec, getDiaDiemLamViec, getListThoiHanNopHoSo, getThongTinKhac,getThoiGianLamViec, "Phúc lợi", "phúc lợi"]
    
    const vt = await searchViTriLamViec(newHtmltext)
    const ht = await searchHinhThucLamViec(newHtmltext)
    const address = await searchDiaDiemLamViec(newHtmltext)
    const time = await searchThoiHanNopHoSo(newHtmltext)
    const yc = await searchYeuCauUngVien(newHtmltext, arr)
    const moTa = await searchMoTaCongViec(newHtmltext, arr)
    const info = await searchThongTinKhac(newHtmltext, arr)
    const luong = await searchMucLuong(extractedText)
    const chedo = await searchPhucLoi(extractedText)


    let tinTuyenDung = {
        congViec: vt,
        hinhThucLamViec: ht,
        diaDiemLamViec: removeCloseTagsExcess(address).trim(),
        thoiHanNopHoSo: removeCloseTagsExcess(time).trim(),
        chitietcongviec: {
            yeucauungvien: yc,
            motacongviec: moTa,
            thongtinkhac: info
        },
        mucLuong: luong,
        chedo: chedo
    }

    return tinTuyenDung
}
module.exports = {
    extractFileWordToObject
}