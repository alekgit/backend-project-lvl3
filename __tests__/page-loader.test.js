import nock from 'nock';
import axios from 'axios';

test('success', () => {
  expect(true).toBe(true);
});

it('async success', async () => {
  nock('http://www.brainjar.com')
    .get('/java/host/test.html')
    .reply(201);

  const link = 'http://www.brainjar.com/java/host/test.html';

  const response = await axios.get(link);
  const { status } = response;
  // console.log(response);
  expect(status).toBe(201);
});
