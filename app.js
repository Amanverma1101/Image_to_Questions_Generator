const fs = require("fs");
const Tesseract = require("tesseract.js");
const path = require("path");
const path_url=path.join(__dirname);


try {
  const files = fs.readdirSync("./Input_Images");
  files.forEach((file) => {
    const filePath = path.join(__dirname+`/Input_Images`, file);
    // const contents = fs.readFileSync(filePath, "utf8");


    Tesseract.recognize(filePath, "eng", {
      logger: (m) => console.log("."),
    })
      .then(({ data: { text } }) => {
        raw_data = text;
        fs.writeFile(
          `${path_url}/Raw_Output_Text/${file}.txt`,
          `${text}`,
          function (err) {
            if (err) throw err;
            console.log(`Output file of ${file} saved successfully.`);
          }
        );
        // console.log(text);
      })
    // console.log(`Content of ${filePath}: `);
  });
} catch (err) {
  console.error(err);
}
