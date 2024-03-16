import { NextApiHandler, NextApiRequest } from "next";
import formidable from "formidable";
import path from "path";
import fs from "fs/promises";
import extract from "extract-zip";

export const config = {
  api: {
    bodyParser: false,
  },
};

const readFile = (
  req: NextApiRequest,
  saveLocally?: boolean
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  const options: formidable.Options = {};
  if (saveLocally) {
    options.uploadDir = path.join(process.cwd(), "/public/zip");
    options.filename = (name, ext, path, form) => {
      return Date.now().toString() + "_" + path.originalFilename;
    };
  }
  options.maxFileSize = 4000 * 1024 * 1024;
  const form = formidable(options);
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err)
      }

      const filesInfo = Object.keys(files).map((key) => {
        const file:any = files[key];
        const filePath = file[0].filepath;
        const fileExt = path.extname(file[0].newFilename);
        const fileName = path.basename(file[0].newFilename, fileExt);
        const destDir = path.join(process.cwd(), "/public/extracted");
        return { filePath, fileExt, destDir };
      });

      const validFiles = filesInfo.every(({ fileExt }) => fileExt === '.zip');
      if(!validFiles){
        reject("INVALID FILE")
      }

      filesInfo.forEach(({filePath, destDir}) => {
        extract(filePath, { dir: `${destDir}` }), (err: any) => {
          if (err) console.error('extraction failed.');
        };
      });

      resolve({ fields, files });
    });
  });
};

const handler: NextApiHandler = async (req, res) => {
  try {
    await fs.readdir(path.join(process.cwd() + "/public", "/zip"));
    await fs.readdir(path.join(process.cwd() + "/public", "/extracted"));
    for (const file of await fs.readdir(path.join(process.cwd() + "/public", "/extracted"))) {
      await fs.unlink(path.join(path.join(process.cwd() + "/public", "/extracted", file)))
    }
  } catch (error) {
    await fs.mkdir(path.join(process.cwd() + "/public", "/zip"));
  }
  await readFile(req, true);
  res.json({ done: "ok" });
};

export default handler;