import { promises as fs, unlinkSync, existsSync } from 'fs';
import os from 'os';
import path from 'path';

import nock from 'nock';
import axios from 'axios';

import pageLoader from '../src';

const link = 'http://www.brainjar.com/java/host/test.html';
const pathToTempDir = os.tmpdir(); // локализовать

const pathToFixtures = `${__dirname}/__fixtures__`;
const htmlFileName = 'www-brainjar-com-java-host-test-html.html';
const resoursesDirName = 'www-brainjar-com-java-host-test-html_files';
const cssFileName = 'css-style.css';
const jsFileName = 'js-main.js';
const imgFileName = 'images-img_bg_1_gradient.jpg';

it('success', () => {
  expect(true).toBe(true);
});

it('async success', async () => {
  nock('http://www.brainjar.com')
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

  it.only('should load page and write file', async () => {
    const pathToFixture = path.join(pathToFixtures, htmlFileName);
    const content = await fs.readFile(pathToFixture, 'utf8');

    nock('http://www.brainjar.com')
      .get('/java/host/test.html')
      .reply(201, content);

    await pageLoader(link, pathToTempDir);
    const result = await fs.readFile(pathToResult, 'utf8');

    expect(result).toBe(content); // ?
  });

  it.only('should load page and resources', async () => {
    /* EXPECTED data block: BEGIN */

    const pathToHTMLFile = path.join(pathToFixtures, htmlFileName);
    const expectedHtml = await fs.readFile(pathToHTMLFile, 'utf8');

    const pathToCSSFile = path.join(pathToFixtures, htmlFileName);
    const expectedCss = await fs.readFile(pathToCSSFile, 'utf8');

    const pathToJSFile = path.join(pathToFixtures, htmlFileName);
    const expectedJs = await fs.readFile(pathToJSFile, 'utf8');

    const pathToImgFile = path.join(pathToFixtures, htmlFileName);
    const expectedImg = await fs.readFile(pathToImgFile, 'utf8');

    /* EXPECTED data block: END */

    nock('http://www.brainjar.com')
      .get('/java/host/test.html')
      .reply(201, expectedHtml);

    await pageLoader(link, pathToTempDir);

    /* ACTUAL data block: BEGIN */

    const pathToActualHtmlFile = path.join(pathToTempDir, resoursesDirName);
    const actualHtml = await fs.readFile(pathToActualHtmlFile, 'utf8');

    const pathToActualCssFile = path.join(pathToTempDir, resoursesDirName, cssFileName);
    const actualCss = await fs.readFile(pathToActualCssFile, 'utf8');

    const pathToActualJsFile = path.join(pathToTempDir, resoursesDirName, jsFileName);
    const actualJs = await fs.readFile(pathToActualJsFile, 'utf8');

    const pathToActualImgFile = path.join(pathToTempDir, resoursesDirName, imgFileName);
    const actualImg = await fs.readFile(pathToActualImgFile, 'utf8');

    /* ACTUAL data block: END */

    expect(actualHtml).toBe(expectedHtml); // ?
    expect(actualCss).toBe(expectedCss); // ?
    expect(actualJs).toBe(expectedJs); // ?
    expect(actualImg).toBe(expectedImg); // ?
  });
});
