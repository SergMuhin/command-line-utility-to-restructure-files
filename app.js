const fs = require('fs');
const path = require('path');

const base = process.argv[2];

let filesPathsArr = [];
let foldersArr = [];

// Пройтись по директории с файлами и папками
const readDir = (base, level) => {
  return new Promise((resolve, reject) => {
    const files = fs.readdirSync(base);

    files.forEach(item => {
      let localBase = path.join(base, item);
      let state = fs.statSync(localBase);

      filesPathsArr.push(localBase);

      if (state.isDirectory()) {
        foldersArr.push(localBase);
        readDir(localBase, level + 1);
      }

    });

    resolve();

  });
};

const createFiles = () => {
  return new Promise((resolve, reject) => {
    let extensions = process.argv[3];
    if (typeof (extensions) === 'undefined' || extensions === 'undefined' || extensions === 'delete') {
      extensions = 'all';
    }
    const c = process.argv[4] === 5 ? 4 : 3;
    let deleteBase = process.argv[c];

    const newBaseFolderName = 'Your sorted folder';
    const rootDirectory = path.parse(base).dir;
    const newPath = path.join(rootDirectory, newBaseFolderName);

    // Создаём новую корневую директорию
    if (!fs.existsSync(path.join(rootDirectory, newBaseFolderName))) {
      try {
        fs.mkdirSync(path.join(rootDirectory, newBaseFolderName));
      } catch (err) {
        throw new Error(err);
      }
    }

    // Проходимся по массиву с файлами
    try {
      filesPathsArr.forEach(fileBasePath => {
        let file = path.parse(fileBasePath).base;
        let fileExtension = path.extname(fileBasePath).substr(1);
        let state = fs.statSync(fileBasePath);

        if (state.isFile() && (extensions.indexOf(fileExtension) >= 0 || extensions === 'all')) {
          let folder = file.substr(0, 1).toUpperCase();
          let fileFolder = path.join(newPath, folder);

          if (!fs.existsSync(fileFolder)) {
            fs.mkdirSync(fileFolder);
          }

          fs.copyFileSync(fileBasePath, path.join(fileFolder, file));

          if (deleteBase === 'delete') {
            fs.unlinkSync(fileBasePath);
          }
        }
      });
    } catch (err) {
      throw new Error(err);
    }

    // Удаляем пустые папки
    try {
      if (deleteBase === 'delete' && extensions === 'all') {
        foldersArr.forEach(emptyFolder => {
          fs.rmdirSync(emptyFolder);
        });
        fs.rmdirSync(base);
      }
    } catch (err) {
      throw new Error(err);
    }

    resolve();

  });
};

async function copyFiles() {
  console.log('readDir');
  await readDir(base, 0);
  console.log('createFiles');
  await createFiles();
}

try {
  copyFiles();
} catch (error) {
  console.error(error);
}
