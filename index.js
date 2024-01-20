const Tesseract = require("tesseract.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config(); 
const  OpenAIApi = require("openai");
const xl = require("excel4node");
const wb = new xl.Workbook();
const ws = wb.addWorksheet("Extracted Questions");


const write_to_excel = (datav1) =>{
  var jsonObj = JSON.parse(datav1);
const headingColumnNames = [
  "problem_text",
  "options",
  "difficuilty_level",
  "topic",
  "sub-topic",
  "correct_option",
];
//Write Column Title in Excel file
let headingColumnIndex = 1;
headingColumnNames.forEach(heading => {
    ws.cell(1, headingColumnIndex++)
        .string(heading)
});
let rowIndex = 2;
for (let i = 0; i < jsonObj.length; i++) {
  let record = jsonObj[i];
  let columnIndex = 1;
  Object.keys(record).forEach((columnName) => {
    ws.cell(rowIndex, columnIndex++).string(record[columnName]);
  });
  rowIndex++;
}
wb.write(`./Final_Excel/${process.env.name}.xlsx`);
}



let raw_data="";

const path_url = path.join(__dirname); 
const openai = new OpenAIApi({
  api_key: `${process.env.OPENAI_API_KEY}`,
});

Tesseract.recognize(
  `./Input_Images/${process.env.name}.png`,
  "eng",
  { logger: (m) => console.log('.') }
).then(({ data: { text } }) => {
    raw_data=text;
    fs.writeFile(
      `${path_url}/Raw_Output_Text/${process.env.name}.txt`,
      `${text}`,
      function (err) {
        if (err) throw err;
        console.log("Raw Output file is saved successfully.");
      }
    );
    // console.log(text);
}).then((d)=>{
    fs.readFile(`./prompt.txt`, function (err, data) {
        if (err) throw err;
        // data is a buffer containing file content
        let prompt = data.toString("utf8");
        let formatted_prompt = prompt.replace("{{input_text}}", raw_data);
        // console.log(formatted_prompt);
        apicall(formatted_prompt);
      }
    );
});



const apicall = async(text)=>{
  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: `${text}` }],
  });
  let outputjson = chatCompletion.choices[0].message.content;
//   console.log(chatCompletion.choices[0].message.content);

var jsonObj = JSON.parse(outputjson);
var jsonContent = JSON.stringify(jsonObj);
write_to_excel(jsonContent);
  fs.writeFile(
        `${path_url}/Formatted_Text/${process.env.name}.json`,
        jsonContent, 'utf8',
        function (err) {
            if (err) throw err;
            console.log("Final Json File & Excel File is saved successfully. You can view the result in the file only !!");
        }
    );
}










