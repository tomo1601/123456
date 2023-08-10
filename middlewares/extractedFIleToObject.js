const fs = require('fs');
const PizZip  = require('pizzip');
const Docxtemplater = require('docxtemplater');

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

    const indexVt = getHeadIndex(listVTKeyWord, text, true)
    const textRemain = text.substring(indexVt)
    
    if(indexVt===-1){
        return 'Không tìm được vị trí làm việc trong văn bản!'
    }
    else {
        const indexEnd = getEndIndex(stopWord, textRemain) + indexVt
        const result = text.substring(indexVt, indexEnd).trim()
        return result
    }

}

const searchHinhThucLamViec = async(text) => {

    const listFulltimeKeyWord = ['Làm việc từ thứ 2 đến thứ 6', 'làm việc từ thứ 2 đến thứ 6', 'Làm việc từ thứ hai đến thứ sáu', 'làm việc từ thứ hai đến thứ sáu', 'Toàn thời gian', 'toàn thời gian',
                                 'Từ thứ 2 đến thứ 6', 'từ thứ 2 đến thứ 6', 'Từ thứ hai đến thứ sáu', 'từ thứ hai đến thứ sáu','5 ngày 1 tuần', 'Năm ngày 1 tuần', 'năm ngày 1 tuần:', '8 tiếng 1 ngày:',
                                 'Thứ 2- Thứ 6', 'thứ 2 - thứ 6', 'Thứ 2 - Thứ 7', 'thứ 2 - thứ 7', 'Thứ 2 đến Thứ 7', 'thứ 2 đến thứ 7',
                                 'Monday to Friday', 'monday to friday', 'Fulltime', 'fulltime', 'Full-time', 'full-time', '5 days a week', '8 hours a day', '40 hours per week' ]

    const listParttimeKeyWord = [ 'Làm việc bán thời gian', 'làm việc bán thời gian', 'Bán thời gian', 'bán thời gian', 'Việc làm thời vụ', 'việc làm thời vụ', 'Thời vụ', 'thời vụ', 'Làm việc theo ca', 
                                  'Giờ làm việc linh hoạt', 'làm việc theo ca', 'giờ làm việc linh hoạt', 'Parttime', 'Part-time', 'parttime', 'part-time', 'Flexible work', 'flexible work' ]

    const listRemoteKeyWord = [ 'Làm việc ở nhà', 'làm việc ở nhà', 'Làm việc từ xa', 'làm việc từ xa', 'Làm việc trực tuyến', 'làm việc trực tuyến', 'Làm việc online', 'làm việc online', 
                                'Không cần đến văn phòng', 'không cần đến văn phòng', 'không gian và thời gian linh hoạt', 'Việc làm từ xa', 'việc làm từ xa', 'Work from home', 'work from home', 'Remote work', 
                                'remote work', 'Online work', 'online work', 'Virtual work', 'Flexibility in space and time', 'flexibility in space and time', 'Independent work', 'independent work'  ]


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
    return 'Fuu-time'
} 

const searchDiaDiemLamViec = async(text) => {
    
    const listLocationKeyWord = ['Địa điểm làm việc cụ thể', 'địa điểm làm việc cụ thể','Địa điểm làm việc: ', 'địa điểm làm việc: ', 'Địa điểm làm việc', 'địa điểm làm việc', 'Địa điểm làm việc cụ thể', 
                                 'địa điểm làm việc cụ thể', 'Chỗ làm việc', 'chỗ làm việc', 'Nơi làm việc', 'nơi làm việc', 'Văn phòng', 'văn phòng', 'Cơ sở:', 'cơ sở:', 'Trụ sở chính', 'trụ sở chính', 'Địa điểm:', 'địa điểm:', 'Địa điểm', 'địa điểm', 
                                 'Không gian văn phòng', 'Work venue', 'work venue', 'Office space', 'office space', 'Workplace', 'workplace', 'Work location', 'work location', 'Workstation', 'workstation', 
                                 'Headquarters', 'headquarters', 'Headquarter', 'headquarter', 'Office', 'office', 'Job site', 'job site'  ]

    const stopWord = ['.','\n', 'với', 'có', 'cà', 'được', 'with', 'have']


    const headIndex = getHeadIndex(listLocationKeyWord, text, true)
    const textRemain = text.substring(headIndex)
    
    if(headIndex===-1){
        return 'Không tìm được vị trí làm việc trong văn bản!'
    }
    else {
        const indexEnd = getEndIndex(stopWord, textRemain) + headIndex
        const result = text.substring(headIndex, indexEnd).trim()
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
    const ht = await searchHinhThucLamViec(extractedText)
    const address = await searchDiaDiemLamViec(extractedText)

    let tinTuyenDung = {
        congViec: vt,
        hinhThucLamViec: ht,
        diaDiemLamViec: address,
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
    }

    console.log(tinTuyenDung)

 
}
module.exports = {
    extractFileWordToObject
}