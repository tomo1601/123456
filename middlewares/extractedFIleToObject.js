const fs = require('fs');
const PizZip  = require('pizzip');
const Docxtemplater = require('docxtemplater');
const mammoth = require('mammoth')

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



const searchViTriLamViec = async(text) => {
    const listVTKeyWord = [ 'Vị Trí:', 'Vị trí', 'vị trí:', 'vị trí', 'Position:', 'position:', 'Position', 'position' ]
    const stopWord = ['.','\n', 'với', 'có', 'cà', 'được', 'with', 'have']

    const indexVt = getHeadIndex(listVTKeyWord, text, true)
    const textRemain = text.substring(indexVt)
    
    if(indexVt===-1){
        return ''
    }
    else {
        const indexEnd = getEndIndex(stopWord, textRemain).index + indexVt
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
    return 'Full-time'
} 

const searchDiaDiemLamViec = async(text) => {
    
    const listLocationKeyWord = ['Địa điểm làm việc cụ thể', 'địa điểm làm việc cụ thể','Địa điểm làm việc: ', 'địa điểm làm việc: ', 'Địa điểm làm việc', 'địa điểm làm việc', 'Địa điểm làm việc cụ thể', 
                                 'địa điểm làm việc cụ thể', 'Chỗ làm việc', 'chỗ làm việc', 'Nơi làm việc', 'nơi làm việc', 'Văn phòng', 'văn phòng', 'Cơ sở:', 'cơ sở:', 'Trụ sở chính', 'trụ sở chính', 'Địa điểm:', 'địa điểm:', 'Địa điểm', 'địa điểm', 
                                 'Không gian văn phòng', 'Work venue', 'work venue', 'Office space', 'office space', 'Workplace', 'workplace', 'Work location', 'work location', 'Workstation', 'workstation', 
                                 'Headquarters', 'headquarters', 'Headquarter', 'headquarter', 'Office', 'office', 'Job site', 'job site' ]

    const closingTags = ["</p>","</h1>", "</h2>", "</h3>", "</h4>", "</h5>", "</h6>","</strong>", "</b>","</em>", "</i>","</u>","</s>", "</del>", "</strike>","</sup>","</sub>","</a>","</ul>","</ol>","</li>","</table>","</tr>","</td>","</th>","</iframe>"];


    const headIndex = getHeadIndex(listLocationKeyWord, text, true)
    const textRemain = text.substring(headIndex)
    
    if(headIndex===-1){
        return ''
    }
    else {
        const indexEnd = getEndIndex(closingTags, textRemain).index + headIndex
        const result = text.substring(headIndex, indexEnd).trim()
        return result
    }
    
} 


const searchThoiHanNopHoSo = async (text) => {
    const listTimeKeyWord = ['Thời hạn ứng tuyển', 'thời hạn ứng tuyển', 'Thời gian kết thúc ứng tuyển', 'thời gian kết thúc ứng tuyển', 'Hạn cuối nộp đơn', 'hạn cuối nộp đơn', 'hạn cuối nộp hồ sơ','hạn cuối nộp hồ sơ',
                             'Hạn chót nộp đơn', 'hạn chót nộp đơn', 'Thời điểm kết thúc ứng tuyển', 'thời điểm kết thúc ứng tuyển', 'Ngày kết thúc nộp đơn', 'ngày kết thúc nộp đơn', 
                             'Hạn nộp đơn ứng tuyển', 'hạn nộp đơn ứng tuyển', 'Hạn nộp hồ sơ ứng tuyển', 'hạn nộp hồ sơ ứng tuyển', 'Thời hạn nộp đơn', 'thời hạn nộp đơn', 'Thời gian kết thúc nộp hồ sơ', 
                             'thời gian kết thúc nộp hồ sơ', 'Ngày cuối nộp hồ sơ', 'ngày cuối nộp hồ sơ', 'Ngày kết thúc nộp đơn', 'ngày kết thúc nộp đơn', 'Ngày cuối cùng nộp hồ sơ', 'ngày cuối cùng nộp hồ sơ', 'Hạn nộp đơn', 
                             'hạn nộp đơn', 'Application deadline', 'application deadline', 'Submission deadline', 'submission deadline', 'Closing date for applications', 'closing date for applications', 'Application cutoff date', 
                             'application cutoff date', 'Last date to apply', 'last date to apply', 'Application end date', 'application end date', 'Final date for application submission', 'final date for application submission', 
                             'Application due date', 'application due date', 'Deadline for applying', 'deadline for applying', "Expiration date", "expiration date" ]

    const closingTags = ["</p>","</h1>", "</h2>", "</h3>", "</h4>", "</h5>", "</h6>","</strong>", "</b>","</em>", "</i>","</u>","</s>", "</del>", "</strike>","</sup>","</sub>","</a>","</ul>","</ol>","</li>","</table>","</tr>","</td>","</th>","</iframe>"];


    const headIndex = getHeadIndex(listTimeKeyWord, text, true)
    const textRemain = text.substring(headIndex)

    if(headIndex===-1){
        return ''
    }
    else {
        const indexEnd = getEndIndex(closingTags, textRemain).index + headIndex
        const result = text.substring(headIndex, indexEnd).trim()
        return result
    }
}

const searchYeuCauUngVien = async (text) => {
    const listYeuCauKeyWord = ['Yêu cầu ứng viên', 'yêu cầu ứng viên', 'Tiêu chí công việc', 'tiêu chí công việc', 'Điều kiện ứng tuyển', 'điều kiện ứng tuyển', 'Kỹ năng và tiêu chí cần thiết','kỹ năng và tiêu chí cần thiết',
                             'Yêu cầu bắt buộc', 'yêu cầu bắt buộc', 'Đặc điểm cần có của ứng viên', 'đặc điểm cần có của ứng viên', 'Điều kiện tiên quyết công việc', 'điều kiện tiên quyết công việc', 
                             'Tiêu chí ứng viên', 'tiêu chí ứng viên', 'Yêu cầu cho người ứng tuyển', 'yêu cầu cho người ứng tuyển', 'Yêu cầu cụ thể của công việc', 'yêu cầu cụ thể của công việc', 'Yêu cầu công việc', 
                             'yêu cầu công việc', 'Tiêu chí làm việc', 'tiêu chí làm việc', 'Năng lực yêu cầu', 'năng lực yêu cầu', 'NĐặc điểm cần có trong công việc', 'đặc điểm cần có trong công việc', 'Yêu cầu cho vị trí', 
                             'yêu cầu cho vị trí', 'Có kiến thức', 'có kiến thức', 'Có kiến thức về', 'có kiến thức về', 'Cần có kiến thức', 'cần có kiến thức', 'Yêu cầu', 'yêu cầu', 'Candidate requirements', 'candidate requirements', 'Job qualifications', 'job qualifications', 'Applicant prerequisites', 'applicant prerequisites', 'Essential skills and qualifications', 
                             'essential skills and qualifications', 'Required qualifications', 'required qualifications', 'Necessary candidate trai', 'necessary candidate trai', 'Job prerequisite', 'job prerequisite', 
                             'Candidate criteria', 'candidate criteria', 'Job-specific requirement', 'job-specific requirement', "Job requirement", "job requirement", 'Position prerequisites', 'position prerequisites', 
                             'Work qualifications', 'work qualifications', 'Essential job skills', 'essential job skills', 'Required competencies', 'required competencies', 'necessary job traits', 'Necessary job traits', 
                             'Employment prerequisite', 'employment prerequisite' ]

    const closingTags = ["</p>","</h1>", "</h2>", "</h3>", "</h4>", "</h5>", "</h6>","</strong>", "</b>","</em>", "</i>","</u>","</s>", "</del>", "</strike>","</sup>","</sub>","</a>","</ul>","</ol>","</li>","</table>","</tr>","</td>","</th>","</iframe>"];


    const headIndex = getHeadIndex(listYeuCauKeyWord, text, false)
    const textRemain = text.substring(headIndex.index)


    if(headIndex===-1){
        return ''
    }
    else {
        const indexEnd = getEndIndex(closingTags, textRemain).index + headIndex.index
        const result = text.substring(headIndex.index, indexEnd).trim()
        return result
    }
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



const extractFileWordToObject = async (file) => {
      
    const content = fs.readFileSync('files/JD-NHANVIENKYTHUATLAYOUT.docx');
    
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
    
    const list_Field = ["Mô tả", "Mô tả: ", "Mô tả công việc", "Mô tả công việc: "]
    const vt = await searchViTriLamViec(extractedText)
    const ht = await searchHinhThucLamViec(extractedText)
    const address = await searchDiaDiemLamViec(textHtml)
    const time = await searchThoiHanNopHoSo(textHtml)
    const yc = await searchYeuCauUngVien(textHtml)

    let tinTuyenDung = {
        congViec: vt,
        hinhThucLamViec: ht,
        diaDiemLamViec: removeCloseTagsExcess(address).trim(),
        thoiHanNopHoSo: removeCloseTagsExcess(time).trim(),
        chitietcongviec: {
            yeucauungvien: removeCloseTagsExcess(yc).trim(),
            motacongviec: "",
            thongtinkhac: ""
        },
        mucLuong: "",
        tinhThanhPho: "",
        quanHuyen: "",
        phuongXa: ""
    }

    console.log(tinTuyenDung)
    console.log(time)

 
}
module.exports = {
    extractFileWordToObject
}