const Resend = require("resend");

const resend = new Resend.Resend(process.env.RESEND_API_KEY);

async function sendEmail(to, subject, verificationToken) {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
  try {
    const { data, error } = await resend.emails.send({
      from: "Expense Tracker <onboarding@resend.dev>",
      to,
      subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Verify your email</title>
        </head>

        <body style="
            margin: 0;
            padding: 0;
            background-color: #f4f4f5;
            font-family: Arial, Helvetica, sans-serif;
        ">
            <div style="
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 10px;
            padding: 40px;
            box-sizing: border-box;
            ">

            <h1 style="
                margin: 0 0 20px;
                color: #18181b;
                font-size: 28px;
            ">
                Verify your email
            </h1>

            <p style="
                color: #52525b;
                font-size: 16px;
                line-height: 1.6;
            ">
                Thanks for creating an account with Expense Tracker.
                Please verify your email address by clicking the button below.
            </p>

            <div style="text-align: center; margin: 30px 0;">
                <a
                href="${verificationLink}"
                style="
                    display: inline-block;
                    padding: 14px 24px;
                    background-color: #7c3aed;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 6px;
                    font-size: 16px;
                    font-weight: bold;
                "
                >
                Verify Email
                </a>
            </div>

            <p style="
                color: #71717a;
                font-size: 14px;
                line-height: 1.5;
            ">
                This verification link will expire in 15 minutes.
            </p>

            <p style="
                color: #71717a;
                font-size: 14px;
                line-height: 1.5;
            ">
                If you didn't create this account, you can safely ignore this email.
            </p>

            <hr style="
                border: none;
                border-top: 1px solid #e4e4e7;
                margin: 30px 0;
            " />

            <p style="
                margin: 0;
                color: #a1a1aa;
                font-size: 12px;
                text-align: center;
            ">
                © 2026 Expense Tracker
            </p>

            </div>
        </body>
        </html>
  `,
    });

    if (error) {
      return console.error(error);
    }
    console.log("email sent: ", data);
  } catch (error) {
    console.error(error);
  }
}

module.exports = sendEmail;
