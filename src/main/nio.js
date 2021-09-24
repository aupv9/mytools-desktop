const { shell } = require('electron');
const os = require('os');
const fs = require('fs');
const p = require('path');
const archivex = require('ls-archive');
const MultiStream = require('multistream');
const { isText } = require('istextorbinary');

module.exports = {
  openPath: (path) => {
    shell.openPath(path);
  },
  existsSync: (path) => {
    return fs.existsSync(path);
  },
  join: (...paths) => {
    return p.join(paths);
  },
  desktopdir: () => {
    return p.join(os.homedir(), 'Desktop');
  },
  homedir: () => {
    return os.homedir();
  },
  dirname: (path) => {
    return p.dirname(path);
  },
  basename: (path) => {
    return p.posix.basename(path);
  },
  extname: (path) => {
    return p.extname(path);
  },
  readFileSync: (path, encoding) => {
    return fs.readFileSync(path, encoding);
  },
  writeFile: (path, data, callback) => {
    fs.writeFile(path, data, callback);
  },
  openSync: (path, flags) => {
    return fs.openSync(path, flags);
  },
  readSync: (fd, buffer, offset, length, position) => {
    return fs.readSync(fd, buffer, offset, length, position);
  },
  closeSync: (fd) => {
    fs.closeSync(fd);
  },
  sep: p.sep,
  archive: {
    list: (archivePath, callback) => {
      archivex.list(archivePath, (err, entries) => {
        const items = [];
        entries.forEach((element) => {
          items.push({ path: element.path, isFile: element.isFile() });
        });

        callback(err, items);
      });
    },
    read: (archivePath, filePath, callback) => {
      archivex.readFile(archivePath, filePath, (err, content) => {
        const isTextFile = isText(null, content);
        let imageMimeType = null;
        let isImageFile = false;
        const fileName = p.posix.basename(filePath);
        if (fileName.endsWith('.svg')) {
          imageMimeType = 'data:image/svg+xml;base64';
        } else if (fileName.endsWith('.gif')) {
          imageMimeType = 'data:image/gif;base64';
        } else if (fileName.endsWith('.png')) {
          imageMimeType = 'data:image/png;base64';
        } else if (fileName.endsWith('.webp')) {
          imageMimeType = 'data:image/webp;base64';
        } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
          imageMimeType = 'data:image/jpeg;base64';
        } else if (fileName.endsWith('.ico')) {
          imageMimeType = 'data:image/x-icon;base64';
        }

        let stringContent = null;
        if (imageMimeType !== null) {
          isImageFile = true;
          stringContent = `${imageMimeType},${content.toString('base64')}`;
        } else if (isTextFile) {
          stringContent = content.toString('UTF-8');
        }

        callback(err, stringContent, isTextFile, isImageFile);
      });
    },
    save: (archivePath, filePath, outputPath, callback) => {
      archivex.readFile(archivePath, filePath, (err, content) => {
        if (err !== null || content === null) {
          callback(new Error('Reading file error'), null);
          return;
        }
        fs.writeFile(outputPath, content, (err2) => {
          if (err2) {
            callback(new Error('Saving file error'), null);
            return;
          }
          callback(null, outputPath);
        });
      });
    },
  },
  mergeFiles: (inputPathList, outputPath) => {
    const fd = fs.openSync(outputPath, 'w+');
    const output = fs.createWriteStream(outputPath);
    const inputList = inputPathList.map((i) => {
      return fs.createReadStream(i);
    });
    return new Promise((resolve, reject) => {
      const multiStream = new MultiStream(inputList);
      multiStream.pipe(output);
      multiStream.on('end', () => {
        fs.closeSync(fd);
        resolve(true);
      });
      multiStream.on('error', () => {
        fs.closeSync(fd);
        reject(new Error('error merging files'));
      });
    });
  },
  safename: (path, fileName, ext) => {
    let newFileName = fileName;
    if (ext !== undefined && ext !== null && ext !== '') {
      newFileName = newFileName.substr(0, newFileName.lastIndexOf('.'));
      newFileName += ext;
    }
    let outputFullPath = p.join(path, newFileName);
    for (let i = 1; i < Number.MAX_VALUE; i += 1) {
      if (fs.existsSync(outputFullPath)) {
        const tmp = `${newFileName.substr(
          0,
          newFileName.lastIndexOf('.')
        )}-${i}${newFileName.substr(newFileName.lastIndexOf('.'))}`;
        outputFullPath = p.join(path, tmp);
      } else {
        break;
      }
    }
    return outputFullPath;
  },
};
