document.getElementById("templateForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const templateName = document.getElementById("templateName").value.trim();
  const templateType = document.getElementById("templateType").value;
  const fontLink1 = document.getElementById("fontLink1").value.trim();
  const fontLink2 = document.getElementById("fontLink2").value.trim();
  const files = document.getElementById("presentationFiles").files;

  if (!templateName || !templateType || !fontLink1 || files.length === 0) {
    alert("Please fill all required fields!");
    return;
  }

  const zip = new JSZip();

  const folderName = `${templateName} ${templateType} Presentation Template`;
  const root = zip.folder(folderName);

  // Documentation folder
  const docFolder = root.folder("Documentation");

  // Font file
  let fontText = `FONT USED IN THIS TEMPLATE :\n\nDownload Here\n- ${extractFontName(fontLink1)} : ${fontLink1}`;
  if (fontLink2) {
    fontText += `\n- ${extractFontName(fontLink2)} : ${fontLink2}`;
  }
  fontText += `\n\nTHANK YOU.`;
  docFolder.file("font.txt", fontText);

  // Readme file
  const readmeText = getReadmeText(templateType, templateName);
  docFolder.file("readme.txt", readmeText);

  // Help file
  const helpFileMap = {
    "PowerPoint": "Help File PowerPoint.pdf",
    "Google Slides": "Help File Google Slides.pdf",
    "Keynote": "Help File Keynote.pdf"
  };

  const helpFileName = helpFileMap[templateType];
  const helpFilePath = `./${helpFileName}`;  // Assuming the help file is in the same directory

  try {
    // Attempting to read the help file from the same directory as the HTML file
    const helpBlob = await fetch(helpFilePath).then(r => r.blob());
    docFolder.file(helpFileName, helpBlob);
  } catch (err) {
    alert("Help file tidak ditemukan! Pastikan file Help File PDF ada di folder ini.");
    return;
  }

  // Main File folder
  const mainFolder = root.folder("Main File");

  if (templateType === "PowerPoint") {
    const pptFolder = mainFolder.folder("PPT File ( MS 97-2003 )");
    const pptxFolder = mainFolder.folder("PPTX File ( Recomended )");
    for (const file of files) {
      if (file.name.endsWith(".ppt")) pptFolder.file(file.name, file);
      else pptxFolder.file(file.name, file);
    }
  } else {
    for (const file of files) {
      mainFolder.file(file.name, file);
    }
  }

  document.getElementById("status").innerText = "Generating ZIP...";
  zip.generateAsync({ type: "blob" }).then(function(content) {
    saveAs(content, `${folderName}.zip`);
    document.getElementById("status").innerText = "Done!";
  });
});

function extractFontName(link) {
  try {
    const url = new URL(link);
    return url.pathname.split('/').filter(Boolean).pop().replace(/[-_]/g, ' ');
  } catch {
    return "Unknown Font";
  }
}


function getReadmeText(type, name) {
  const base = `Introducing **${name} ${type} Presentation Template**`;
  return `${base}

This is a professional template designed for ${type}.`;
}
         ${type === "Keynote" ? "Template" : "Presentation Template"}**

**Main Feature :**
- All graphics resizable and editable
- Used and recommended free web fonts
- Based on Master Slides${type === "Keynote" ? " & color theme" : ""}
- 16:9 Wide Screen Ratio
- Picture Placeholder
${type === "Keynote" ? "- Just Drag and Drop!" : ""}
- Easily Editable!

**File Included :**
- ${type} ${type === "Keynote" ? ".Key" : ".PPTX"} file${type === "PowerPoint" ? "\n- PowerPoint .PPT file" : ""}
- Documentation File

**Font Used :**
- All Font Free
- Link Download include in ${type === "Keynote" ? "Help File" : "Documentation"}

**Note: Images are not included and are used for demo purposes only.**`;

  return base;
}
