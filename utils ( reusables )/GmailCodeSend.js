import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'muhammadzain7113@gmail.com',
    pass: 'atun lpqh wcwv huaa',
  },
});

export const sendCodeOnGmail = async (gmail, code) => {
  try {
    let process = await transporter.sendMail({
      from: 'muhammadzain7113@gmail.com',
      to: gmail,
      subject: 'Your Reset Password Code',
      text: `Your verification code is: ${code}`,
    });
    if (process) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};
