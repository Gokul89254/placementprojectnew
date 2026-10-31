const assert = require('node:assert/strict');
const net = require('node:net');
const { test } = require('node:test');

test('sends workflow emails through configured SMTP', async () => {
  const messages = [];
  const server = net.createServer(socket => {
    let buffer = '';
    let readingMessage = false;
    let messageLines = [];
    socket.write('220 localhost ESMTP\r\n');

    socket.on('data', chunk => {
      buffer += chunk.toString();
      let lineEnd = buffer.indexOf('\r\n');
      while (lineEnd !== -1) {
        const line = buffer.slice(0, lineEnd);
        buffer = buffer.slice(lineEnd + 2);

        if (readingMessage) {
          if (line === '.') {
            readingMessage = false;
            messages.push(messageLines.join('\n'));
            messageLines = [];
            socket.write('250 Message accepted\r\n');
          } else {
            messageLines.push(line.startsWith('..') ? line.slice(1) : line);
          }
        } else if (/^EHLO /i.test(line) || /^HELO /i.test(line)) {
          socket.write('250-localhost\r\n250-AUTH PLAIN\r\n250 SIZE 10000000\r\n');
        } else if (/^AUTH PLAIN /i.test(line)) {
          socket.write('235 Authentication successful\r\n');
        } else if (/^MAIL FROM:/i.test(line) || /^RCPT TO:/i.test(line)) {
          socket.write('250 Accepted\r\n');
        } else if (/^DATA$/i.test(line)) {
          readingMessage = true;
          socket.write('354 End data with <CR><LF>.<CR><LF>\r\n');
        } else if (/^QUIT$/i.test(line)) {
          socket.write('221 Bye\r\n');
          socket.end();
        } else {
          socket.write('250 OK\r\n');
        }

        lineEnd = buffer.indexOf('\r\n');
      }
    });
  });

  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  process.env.SMTP_HOST = '127.0.0.1';
  process.env.SMTP_PORT = String(server.address().port);
  process.env.SMTP_SECURE = 'false';
  process.env.SMTP_USER = 'test-user';
  process.env.SMTP_PASSWORD = 'test-password';
  process.env.SMTP_FROM = 'Placemate <no-reply@example.test>';

  try {
    const notifications = require('../src/services/emailNotificationService');
    await notifications.sendJobPendingReview({
      admin_emails: ['admin@example.test'],
      job_id: 12,
      job_title: 'Software Engineer',
      company_name: 'Example Company',
      location: 'Remote',
      deadline: '2026-12-31'
    });
    await notifications.sendCompanyPendingReview({
      admin_emails: ['admin@example.test'],
      company_id: 8,
      company_name: 'Example Company',
      recruiter_name: 'Alex Recruiter',
      recruiter_email: 'recruiter@example.test',
      location: 'Remote'
    });
    await notifications.sendApplicationSubmitted({
      student_name: 'Alex Student',
      student_email: 'student@example.test',
      recruiter_email: 'recruiter@example.test',
      job_title: 'Software Engineer',
      company_name: 'Example Company'
    });
    await notifications.sendApplicationStatus({
      student_name: 'Alex Student',
      student_email: 'student@example.test',
      status: 'shortlisted',
      job_title: 'Software Engineer',
      company_name: 'Example Company'
    });
    await notifications.sendInterviewNotification({
      student_name: 'Alex Student',
      student_email: 'student@example.test',
      round_name: 'Technical',
      scheduled_at: '2026-11-01 10:00',
      mode: 'online',
      meeting_link: 'https://example.test/meeting',
      job_title: 'Software Engineer',
      company_name: 'Example Company'
    }, 'scheduled');
    await notifications.sendPlacementResult({
      student_name: 'Alex Student',
      student_email: 'student@example.test',
      result_status: 'accepted',
      job_title: 'Software Engineer',
      company_name: 'Example Company'
    });

    assert.equal(messages.length, 7);
    assert.ok(messages.some(message => message.includes('admin@example.test')));
    assert.ok(messages.some(message => message.includes('/admin/jobs')));
    assert.ok(messages.some(message => message.includes('/admin/companies')));
    assert.ok(messages.some(message => message.includes('student@example.test')));
    assert.ok(messages.some(message => message.includes('recruiter@example.test')));
    assert.ok(messages.some(message => message.includes('shortlisted')));
    assert.ok(messages.some(message => message.includes('https://example.test/meeting')));
    assert.ok(messages.some(message => message.includes('accepted')));
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});
