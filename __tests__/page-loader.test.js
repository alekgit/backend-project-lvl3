import { promises as fs, unlinkSync, existsSync } from 'fs';
import os from 'os';
import path from 'path';

import nock from 'nock';
import axios from 'axios';

import pageLoader from '../src';

const link = 'http://www.brainjar.com/java/host/test.html';
const pathToTempDir = os.tmpdir(); // -?- локализовать

const pathToFixtures = `${__dirname}/__fixtures__`;
const htmlFileName = 'www-brainjar-com-java-host-test-html.html';
const expectedHtmlFileName = 'www-brainjar-com-java-host-test-html_expected.html';
const resoursesDirName = 'www-brainjar-com-java-host-test-html_files';
const cssFileName = 'css-style.css';
const jsFileName = 'js-main.js';
const jsFileName2 = 'js-lala-gaga-main2.js';
const imgFileName = 'images-img_bg_1_gradient.jpg';
const imgFileName2 = 'images-img_bg_2_gradient.jpg';
const imgFileName3 = 'images-img_bg_3_gradient.jpg';

it('success', () => {
  expect(true).toBe(true);
});

it('async success', async () => {
  nock('http://www.brainjar.com/')
    .get('/java/host/test.html')
    .reply(201);

  const response = await axios.get(link);
  const { status } = response;
  expect(status).toBe(201);
});

describe('page loader', () => {
  const pathToResult = path.join(pathToTempDir, htmlFileName);

  beforeEach(() => {
    if (existsSync(pathToResult)) {
      unlinkSync(pathToResult);
    }
  });

  afterEach(() => {
    if (existsSync(pathToResult)) {
      unlinkSync(pathToResult);
    }
  });

  it('should load page and resources', async () => {
    /* EXPECTED data block: BEGIN */

    // Вводим responsed type из-за кастомного форматирования cheerio
    const pathToResponseHTMLFile = path.join(pathToFixtures, htmlFileName);
    const responsedHtml = await fs.readFile(pathToResponseHTMLFile, 'utf8');
    // console.log('----------responsedHtml----------'); console.log(responsedHtml);

    const pathToExpectedHTMLFile = path.join(pathToFixtures, expectedHtmlFileName);
    const expectedDirtyHtml = await fs.readFile(pathToExpectedHTMLFile, 'utf8');
    const expectedHtml = expectedDirtyHtml.trim();
    // console.log('----------expectedHtml----------'); console.log(expectedHtml);

    const pathToCSSFile = path.join(pathToFixtures, 'css/style.css');
    const expectedCss = await fs.readFile(pathToCSSFile, 'utf8');

    const pathToJSFile = path.join(pathToFixtures, 'js/main.js');
    const expectedJs = await fs.readFile(pathToJSFile, 'utf8');

    const pathToImgFile = path.join(pathToFixtures, 'images/img_bg_1_gradient.jpg');
    const expectedImg = await fs.readFile(pathToImgFile, 'utf8');

    /* EXPECTED data block: END */

    nock('http://www.brainjar.com')
      .get('/java/host/test.html')
      .reply(200, responsedHtml);

    nock('http://www.brainjar.com')
      .get('/java/host/css/style.css')
      .reply(200, expectedCss);

    nock('http://www.brainjar.com')
      .get('/java/host/images/img_bg_1_gradient.jpg')
      .reply(200, expectedImg);
    nock('http://www.brainjar.com')
      .get('/java/host/images/img_bg_2_gradient.jpg')
      .reply(200, expectedImg);
    nock('http://www.brainjar.com')
      .get('/java/host/images/img_bg_3_gradient.jpg')
      .reply(200, expectedImg);

    nock('http://www.brainjar.com')
      .get('/java/host/js/main.js')
      .reply(200, expectedJs);
    nock('http://www.brainjar.com')
      .get('/java/host/js/lala/gaga/main2.js')
      .reply(200, expectedJs);

    await pageLoader(link, pathToTempDir);

    /* ACTUAL data block: BEGIN */

    const pathToActualHtmlFile = path.join(pathToTempDir, htmlFileName);
    const actualHtml = await fs.readFile(pathToActualHtmlFile, 'utf8');
    // console.log('----------actualHtml----------'); console.log(actualHtml);

    const pathToActualCssFile = path.join(pathToTempDir, resoursesDirName, cssFileName);
    const actualCss = await fs.readFile(pathToActualCssFile, 'utf8');

    const pathToActualJsFile = path.join(pathToTempDir, resoursesDirName, jsFileName);
    const actualJs = await fs.readFile(pathToActualJsFile, 'utf8');

    const pathToActualJsFile2 = path.join(pathToTempDir, resoursesDirName, jsFileName2);
    const actualJs2 = await fs.readFile(pathToActualJsFile2, 'utf8');

    const pathToActualImgFile = path.join(pathToTempDir, resoursesDirName, imgFileName);
    const actualImg = await fs.readFile(pathToActualImgFile, 'utf8');

    const pathToActualImgFile2 = path.join(pathToTempDir, resoursesDirName, imgFileName2);
    const actualImg2 = await fs.readFile(pathToActualImgFile2, 'utf8');

    const pathToActualImgFile3 = path.join(pathToTempDir, resoursesDirName, imgFileName3);
    const actualImg3 = await fs.readFile(pathToActualImgFile3, 'utf8');
    /* ACTUAL data block: END */

    expect(actualHtml).toBe(expectedHtml);
    expect(actualCss).toBe(expectedCss);
    expect(actualJs).toBe(expectedJs);
    expect(actualJs2).toBe(expectedJs);
    expect(actualImg).toBe(expectedImg);
    expect(actualImg2).toBe(expectedImg);
    expect(actualImg3).toBe(expectedImg);
  });
});
