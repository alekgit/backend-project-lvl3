import { promises as fs, unlinkSync, existsSync } from 'fs';
import os from 'os';
import path from 'path';

import nock from 'nock';
import axios from 'axios';

import pageLoader from '../src';

const link = 'http://www.brainjar.com/java/host/test.html';
const pathToFixtures = `${__dirname}/__fixtures__`;
const pathToTempDir = os.tmpdir();
const fileName = 'www-brainjar-com-java-host-test-html.html';

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
  const pathToResult = path.join(pathToTempDir, fileName);

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

  it('should load page and write file', async () => {
    const pathToFixture = path.join(pathToFixtures, fileName);
    const content = await fs.readFile(pathToFixture, 'utf8');

    nock('http://www.brainjar.com')
      .get('/java/host/test.html')
      .reply(201, content);

    await pageLoader(link, pathToTempDir);
    const result = await fs.readFile(pathToResult, 'utf8');

    expect(result).toBe(content); // ?
  });
});
