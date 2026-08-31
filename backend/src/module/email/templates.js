

export const otpEmailTemplate = ({
    firstName,
    otp
}) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Email Verification</title>
        </head>

        <body>
            <h2>Verify your email</h2>

            <p>Hello ${firstName},</p>

            <p>
                Your email verification OTP is:
            </p>

            <h1>${otp}</h1>

            <p>
                This OTP will expire in 10 minutes.
            </p>

            <p>
                If you did not create this account,
                you can ignore this email.
            </p>
        </body>
        </html>
    `;
};


export const welcomeEmailTemplate = ({
    firstName,
}) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Welcome to Authentication API</title>
    </head>
    <body>
        <h2>Welcome to Authentication API!</h2>
        <p>Hello ${firstName},</p>
        <p>
            Thank you for registering with Authentication API.
            Your account has been successfully created.
        </p>
        <p>You can now log in using your credentials.</p>
        <p>If you did not create this account, you can ignore this email.</p>
    </body>
    </html>
    `;
};