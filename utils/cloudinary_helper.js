const cloudinary = require('cloudinary').v2;
const randomstring = require('randomstring');
const os = require('os');

const { Logger } = require('./Logger');

const log = new Logger('cloudinary_helper');

cloudinary.config({
  cloud_name: process.env.LCK_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.LCK_CLOUDINARY_API_KEY,
  api_secret: process.env.LCK_CLOUDINARY_API_SECRET,
});

function uploadUrl(url, folder, name) {
  log.info(`[uploadUrl] folder: ${folder} name: ${name} url: ${url}`);
  const folderPath = folder ? `${folder}/` : '';
  return cloudinary.uploader.upload(url, { public_id: `${folderPath}${name}` });
  // return new Promise((resolve, reject) => {
  //   cloudinary.uploader.upload(
  //     url,
  //     { public_id: `${folderPath}${name}` },
  //     (error, result) => {
  //       if (error) reject(new Error(error));
  //       else resolve(result);
  //     },
  //   );
  // });
}

/**
 *
 * @param image an object that belongs to this module: https://www.npmjs.com/package/express-fileupload
 * @param path
 * @returns {Promise<unknown>}
 */
function moveFile(image, path) {
  return new Promise((resolve, reject) => {
    image.mv(path, (err) => {
      if (err) reject(new Error(err));
      else resolve();
    });
  });
}

/**
 *
 * @param image an object that belongs to this module: https://www.npmjs.com/package/express-fileupload
 * @param recipeId
 * @returns {Promise<string>} the name of the uploaded imae
 */
module.exports.uploadFile = async function (image, recipeId) {
  const tmp = os.tmpdir();
  const name = `${recipeId}_${randomstring.generate(12)}`;
  const path = `${tmp}/${name}`;
  await moveFile(image, path);
  log.info(`path: ${path}`);
  log.info(`uploading image to cloudinary: ${name}`);
  await cloudinary.uploader.upload(path, { public_id: `${name}` });
  return name;
};

module.exports.uploadImages = async function (imagesCsv, recipeId) {
  const array = imagesCsv.split(',');
  log.info(`[uploadImages] images: ${array.length}`);
  let index = 0;
  const folder = process.env.LCK_CLOUDINARY_FOLDER || '';
  const imagesNames = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const url of array) {
    const imageName = `${recipeId}_${index}`;
    imagesNames.push(imageName);
    // eslint-disable-next-line no-await-in-loop
    const result = await uploadUrl(url.trim(), folder, imageName);
    log.info(result.asset_id);
    // console.info(url);
    index++;
  }
  return imagesNames;
};

// uncomment to test quickly
// this.uploadImages('https://elandroidelibre.elespanol.com/wp-content/uploads/2020/04/sky-ni%C3%B1os-de-la-luz-3.jpg,https://www.shell.com/energy-and-innovation/the-energy-future/scenarios/shell-scenario-sky/_jcr_content/pagePromo/image.img.960.jpeg/1548184031017/clear-blue-sky.jpeg',
//   1234567)
//   .then(() => console.info('done'))
//   .catch((err) => {
//     console.error('error uploading...');
//     console.error(err);
//   });
