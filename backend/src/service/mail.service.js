import { google } from 'googleapis'

const OAuth2 = google.auth.OAuth2

const createTransporter = async () => {
  const oauth2Client = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  )

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  })

  const accessToken = await new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        console.error('Failed to get access token:', err)
        reject(err)
      }
      resolve(token)
    })
  })

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client })
  return { gmail, accessToken }
}


// const transporter = await createTransporter()
// transporter.verify()
//     .then(() => { console.log("Email transporter is ready to send emails"); })
//     .catch((err) => { console.error("Email transporter verification failed:", err); });

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const { gmail } = await createTransporter()

    const emailLines = [
      `From: AskMee.AI <${process.env.GOOGLE_USER}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      html
    ]

    const email = emailLines.join('\r\n')
    const encodedEmail = Buffer.from(email)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail
      }
    })

    console.log('Email sent successfully:', result.data.id)
    return result.data

  } catch (error) {
    console.error('Gmail API send failed:', error.message)
    throw error
  }
}