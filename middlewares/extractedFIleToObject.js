const fs = require('fs');
const PizZip  = require('pizzip');
const Docxtemplater = require('docxtemplater');

const getHeadIndex = (arr, text) => {
    for(const a of arr) {
        const index = text.indexOf(a)
        if(index!==-1){
            return index +a.length;
        }
    }
    return -1;
}

const getEndIndex = (arr, text) => {

    let indexResult =  text.indexOf(arr[0])
    for(const a of arr) {
        const index = text.indexOf(a)
        if(index!==-1 && index< indexResult){
            indexResult= index;
        }
    }
    return indexResult;
}



const searchViTriLamViec = async(text) => {
    const listVTKeyWord = [ 'Vị Trí:', 'Vị trí', 'vị trí:', 'vị trí', 'Position:', 'position:', 'Position', 'position' ]
    const stopWord = ['.','\n', 'với', 'có', 'cà', 'được', 'with', 'have']

    const indexVt = getHeadIndex(listVTKeyWord, text)
    const textRemain = text.substring(indexVt)
    const indexEnd = getEndIndex(stopWord, textRemain) + indexVt

    console.log(indexVt, indexEnd)
    if(indexEnd===-1||indexEnd===-1){
        return 'Không tìm được vị trí làm việc trong file!'
    }
    else {
        const result = text.substring(indexVt, indexEnd).trim()
        return result
    }

}


const extractFileWordToObject = async (file) => {
      
    const content = fs.readFileSync('files/JD-NHANVIENKYTHUATLAYOUT.docx');
    
    const zip = new PizZip();
    zip.load(content);

    // Create a new Docxtemplater instance with the pizzip zip
    const doc = new Docxtemplater().loadZip(zip);

    // Render the content to extract text
    const extractedText = doc.getFullText();

    console.log(extractedText);
    
    const list_Field = ["Mô tả", "Mô tả: ", "Mô tả công việc", "Mô tả công việc: "]
    const vt = await searchViTriLamViec(extractedText)
    console.log(vt)

    /* let tinTuyenDung = {
        congViec: "",
        hinhThucLamViec: "",
        diaDiemLamViec: "",
        thoiHanNopHoSo: "",
        chitietcongviec: {
            yeucauungvien: "",
            motacongviec: "",
            thongtinkhac: ""
        },
        mucLuong: "",
        tinhThanhPho: "",
        quanHuyen: "",
        phuongXa: ""
    } */
 
}
module.exports = {
    extractFileWordToObject
}